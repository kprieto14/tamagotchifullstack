from flask import g, abort
from models.User import UsersModel

def get_current_user():
    payload = getattr(g, 'current_user', None)
    if not payload:
        abort(401)
    auth0_sub = payload['sub']
    return UsersModel.query.filter_by(AuthSubject=auth0_sub).first()