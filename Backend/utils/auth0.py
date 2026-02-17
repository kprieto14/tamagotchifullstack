# auth0.py
import json
from functools import wraps
from urllib.request import urlopen

from flask import current_app, request, g, jsonify
from jose import jwt


class AuthError(Exception):
    """Standardized Auth0 auth error."""

    def __init__(self, error, status_code):
        super().__init__(error)
        self.error = error
        self.status_code = status_code

def get_token_auth_header():
    """Extracts the Bearer token from the Authorization header."""
    auth = request.headers.get('Authorization', None)
    if not auth:
        raise AuthError(
            {
                'code': 'authorization_header_missing',
                'description': 'Authorization header is expected',
            },
            401,
        )

    parts = auth.split()

    if parts[0].lower() != 'bearer':
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Authorization header must start with Bearer',
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthError(
            { 'code': 'invalid_header', 'description': 'Token not found' }, 401
        )
    elif len(parts) > 2:
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Authorization header must be Bearer token',
            },
            401,
        )

    token = parts[1]
    return token

_JWKS_CACHE = None

def _get_jwks(domain: str):
    global _JWKS_CACHE
    if _JWKS_CACHE is None:
        jsonurl = urlopen(f'https://{domain}/.well-known/jwks.json')
        _JWKS_CACHE = json.loads(jsonurl.read())
    return _JWKS_CACHE


def verify_jwt(token: str):
    """
    Verifies the JWT using Auth0's JWKS and returns the decoded payload.
    Raises AuthError if verification fails.
    """
    domain = current_app.config['AUTH0_DOMAIN']
    audience = current_app.config['AUTH0_AUDIENCE']
    algorithms = current_app.config.get('AUTH0_ALGORITHMS', ['RS256'])

    jwks = _get_jwks(domain)
    unverified_header = jwt.get_unverified_header(token)

    if 'kid' not in unverified_header:
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Authorization malformed (no kid in header)',
            },
            401,
        )

    rsa_key = {}
    for key in jwks['keys']:
        if key['kid'] == unverified_header['kid']:
            rsa_key = {
                'kty': key['kty'],
                'kid': key['kid'],
                'use': key['use'],
                'n': key['n'],
                'e': key['e'],
            }
            break

    if not rsa_key:
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Unable to find appropriate key',
            },
            401,
        )

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=algorithms,
            audience=audience,
            issuer=f'https://{domain}/',
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError(
            {'code': 'token_expired', 'description': 'Token expired'}, 401
        )
    except jwt.JWTClaimsError:
        raise AuthError(
            {
                'code': 'invalid_claims',
                'description': 'Incorrect claims. Check audience and issuer.',
            },
            401,
        )
    except Exception:
        raise AuthError(
            {'code': 'invalid_header', 'description': 'Unable to parse authentication token.'},
            400,
        )


def requires_auth(f):
    """
    Decorator that ensures a valid Auth0 JWT is provided.
    Sets g.current_user to the decoded payload.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        payload = verify_jwt(token)
        # Attach user info to request context
        g.current_user = payload
        return f(*args, **kwargs)

    return decorated


def register_auth_error_handlers(app):
    """Register global error handlers for AuthError."""

    @app.errorhandler(AuthError)
    def handle_auth_error(ex):
        response = jsonify(ex.error)
        response.status_code = ex.status_code
        return response