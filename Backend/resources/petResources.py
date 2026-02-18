from flask.views import MethodView
from flask_smorest import Blueprint
from utils.auth0 import requires_auth
from db import db
from models.Action import ActionsModel
from models.Breed import BreedsModel
from models.Interaction import InteractionsModel
from models.Pet import PetsModel
from models.User import UsersModel
from schemas.petSchema import NewPetSchema, PetOptionsSchema, PetSchema, UpdatePetSchema, UpdatePetSchema
from utils.getUser import get_current_user
from constants import ACTIONS, BREEDS

blueprint = Blueprint('Pets', __name__, description='Operations to manage pets')

# Endpoint to get all pets for a user
@blueprint.route('/api/pets/<int:user_id>')
class PetListResource(MethodView):
    @requires_auth
    @blueprint.response(200, PetSchema(many=True))
    def get(self, user_id):
        """List all pets for a user"""
        user = UsersModel.query.get_or_404(user_id)
        if user:
            # Check to make sure user is only accessing their own pets
            if user.Id != get_current_user().Id:
                return {'message': 'Unauthorized access to pets'}, 403
            # Return pets by oldest to newest 
            pets = PetsModel.query.filter_by(UserId=user_id).order_by(PetsModel.Birthday.asc()).all()
            return pets

        return {'message': 'User not found'}, 404

    @requires_auth
    @blueprint.arguments(NewPetSchema)
    @blueprint.response(201, PetSchema)
    def post(self, pet_data, user_id):
        """Create a new pet for a user"""
        # Check to make sure user is only adding to their own pets
        user = UsersModel.query.get_or_404(user_id)
        if user.Id != get_current_user().Id:
            return {'message': 'Unauthorized access to create pet'}, 403
        # Check if user already has 6 pets (before creating new one), saves resources
        pets = PetsModel.query.filter_by(UserId=user_id).all()
        if len(pets) >= 6:
            return {'message': 'User cannot have more than 6 pets'}, 400
        # Grab actual pet provided by name in request body
        breed_type = BreedsModel.query.filter_by(Type=pet_data['BreedType']).first()
        if breed_type:
            new_pet = PetsModel(
                Name=pet_data['Name'], 
                UserId=user_id, 
                BreedId=breed_type.Id
            )

            try:
                db.session.add(new_pet)
                db.session.commit()
                return new_pet, 201
            except Exception as error:
                db.session.rollback()
                return {'message': f'Error creating pet: {error}'}, 500
        return {'message': 'Valid pet type is required'}, 400

# Endpoint to get, edit, or delete a specific pet by its ID
@blueprint.route('/api/pet/<int:pet_id>')
class PetResource(MethodView):
    @requires_auth
    @blueprint.response(200, PetSchema)
    def get(self, pet_id):
        """Get a specific pet by its ID"""
        # Check to make sure user is only accessing their own pets
        pet = PetsModel.query.get_or_404(pet_id)
        if pet:
            if pet.UserId != get_current_user().Id:
                return {'message': 'Unauthorized access to pet'}, 403
            return pet

        return {'message': 'Pet not found'}, 404 

    @requires_auth
    @blueprint.arguments(UpdatePetSchema)
    @blueprint.response(200, PetSchema)
    def put(self, pet_data, pet_id):
        """Update a pet's stats by its ID"""
        pet = PetsModel.query.get_or_404(pet_id)
        if pet:
            # Check to make sure user is only updating their own pets
            if pet.UserId != get_current_user().Id:
                return {'message': 'Unauthorized access to update pet'}, 403

            # Passed in schema ensures only valid interaction actions are provided
            interact_action = ActionsModel.query.filter_by(Type=pet_data['InteractAction']).first()
            if interact_action:
                message = pet.interact(interact_action.Type, pet_data.get('Name', None))
                interaction = InteractionsModel(PetId=pet.Id, ActionId=interact_action.Id)
                try:
                    db.session.add(pet)
                    db.session.add(interaction)
                    db.session.commit()
                except Exception as error:
                    db.session.rollback()
                    return {'message': f'Error updating pet: {error}'}, 500
                # Return pet with interaction message
                result = PetSchema().dump(pet)
                result['message'] = message
                return result, 200
            else:
                return {'message': 'Valid interaction action is required'}, 400
        return {'message': 'Pet not found'}, 404

    @requires_auth
    @blueprint.response(204)
    def delete(self, pet_id):
        """Delete a pet by its ID"""
        pet = PetsModel.query.get_or_404(pet_id)
        if pet:
            # Check to make sure user is only deleting their own pets
            if pet.UserId != get_current_user().Id:
                return {'message': 'Unauthorized access to delete pet'}, 403

            try:
                db.session.delete(pet)
                db.session.commit()
                return {'message': 'Pet deleted successfully'}, 204
            except Exception as error:
                db.session.rollback()
                return {'message': f'Error deleting pet: {error}'}, 500
        return {'message': 'Pet not found'}, 404

# Endpoint to grab generic types for breeds/ interactions
@requires_auth
@blueprint.route('/api/options')
class TypeListResource(MethodView):
    @blueprint.response(200, PetOptionsSchema)
    def get(self):
        """Get all types for breeds and interactions"""
        breeds = BreedsModel.query.all()
        actions = ActionsModel.query.all()
        return {
            'Breeds': breeds,
            'Actions': actions
        }