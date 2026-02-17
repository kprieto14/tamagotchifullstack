from flask import request
from flask.views import MethodView
from flask_smorest import Blueprint
from utils.auth0 import requires_auth
from db import db
from models.User import UsersModel
from schemas.userSchema import PlainUserSchema, ReturnUserSchema
from utils.auth0 import requires_auth
from utils.getUser import get_current_user

blueprint = Blueprint('Users', __name__, description='Operations to manage users')

# Endpoint to POST a new user (registration) or return a found user (login)
@blueprint.route('/api/user')
class UserResource(MethodView):
    @requires_auth
    @blueprint.arguments(PlainUserSchema)
    @blueprint.response(201, ReturnUserSchema)
    def post(self, user_data):
        """Create a new user"""
        # Check if user already exists
        existing_user = UsersModel.query.filter_by(AuthSubject=user_data['AuthSubject']).first()
        if existing_user:
            # Check if auth subject matches, if not, return error to prevent hijacking
            if existing_user.Id != get_current_user().Id:
                return {'message': 'Auth subject mismatch for existing user.'}, 400
            # Check if email/ username matches, update if different
            if existing_user.Email != user_data['Email'] or existing_user.Username != user_data['Username']:
                try:
                    existing_user.Email = user_data['Email']
                    existing_user.Username = user_data['Username']
                    db.session.commit()
                except Exception as error:
                    db.session.rollback()
                    return {'message': f'Error updating user with Id {existing_user.Id}: {error}'}, 500
            return existing_user, 201
        # Otherwise create new user
        new_user = UsersModel(**user_data)
        try:
            db.session.add(new_user)
            db.session.commit()
            return new_user, 201
        except Exception as error:
            db.session.rollback()
            return {'message': f'Error creating user: {error}'}, 500
