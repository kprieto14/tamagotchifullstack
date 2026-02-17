import pytest
from datetime import datetime, timedelta, timezone
from flask import Flask
from flask_smorest import Api
from marshmallow import ValidationError
from db import db
from resources import petResources
from models.Pet import PetsModel
from models.Breed import BreedsModel
from models.User import UsersModel
from models.Interaction import InteractionsModel
from models.Action import ActionsModel
from schemas.petSchema import NewPetSchema
from services.breeds import as_breed_instance
import utils.auth0 as auth0 


@pytest.fixture
def app():
    """Create a Flask app with in-memory DB and registered API for tests."""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Smorest config (minimal)
    app.config["API_TITLE"] = "Test API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"

    db.init_app(app)

    # Register Pets blueprint via Flask-Smorest Api
    api = Api(app)
    api.register_blueprint(petResources.blueprint)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def session(app):
    """Convenience alias for db.session inside an app context."""
    return db.session

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(session):
    user = UsersModel(
        Email='test@example.com',
        Username='test_user',
        AuthProvider='auth0',
        AuthSubject='auth0|12345',
    )
    session.add(user)
    session.commit()
    return user

@pytest.fixture
def other_user(session):
    user = UsersModel(
        Email='other@example.com',
        Username='other_user',
        AuthProvider='auth0',
        AuthSubject='auth0|67890',
    )
    session.add(user)
    session.commit()
    return user

@pytest.fixture
def breeds(session):
    """Seed the three valid breeds."""
    benshis = BreedsModel(Type='Benshis')
    moomis = BreedsModel(Type='Moomis')
    pooshis = BreedsModel(Type='Pooshis')
    session.add_all([benshis, moomis, pooshis])
    session.commit()
    return {'Benshis': benshis, 'Moomis': moomis, 'Pooshis': pooshis}

@pytest.fixture
def actions(session):
    """Seed Actions: Feed / Play / Hug."""
    feed = ActionsModel(Type='Feed')
    play = ActionsModel(Type='Play')
    hug = ActionsModel(Type='Hug')
    session.add_all([feed, play, hug])
    session.commit()
    return {'Feed': feed, 'Play': play, 'Hug': hug}

@pytest.fixture(autouse=True)
def fake_auth(monkeypatch):
    """
    Disable real Auth0 checks for tests by faking the auth layer.
    This runs automatically for every test (autouse=True).
    """

    # Pretend we always have a valid Authorization header
    monkeypatch.setattr(auth0, 'get_token_auth_header', lambda: 'Bearer test-token')

    # Pretend token verification always succeeds and returns a payload
    def fake_verify_jwt(*args, **kwargs):
        return {
            'sub': 'auth0|test-user',
            'permissions': [],
        }

    monkeypatch.setattr(auth0, 'verify_jwt', fake_verify_jwt)


def test_create_pet_defaults(app, session, test_user, breeds):
    """
    Creating a pet with only required fields should set stat defaults
    (Hunger/Happiness/Friendship to 0, IsDead to False).
    """
    breed = breeds['Benshis']

    pet = PetsModel(
        Name='Fluffy',
        UserId=test_user.Id,
        BreedId=breed.Id,
    )
    session.add(pet)
    session.commit()

    saved = db.session.get(PetsModel, pet.Id)
    assert saved is not None
    assert saved.Name == 'Fluffy'
    assert saved.HungerLevel == 0
    assert saved.HappinessLevel == 0
    assert saved.FriendshipLevel == 0
    assert saved.IsDead is False
    assert isinstance(saved.Birthday, datetime)
    assert isinstance(saved.LastInteractedWith, datetime)


def test_new_pet_schema_rejects_invalid_breed(app):
    """
    NewPetSchema should reject any BreedType outside the allowed set.
    """
    schema = NewPetSchema()

    invalid_payload = {
        'Name': 'Dragon',
        'BreedType': 'Dragon',
    }

    with pytest.raises(ValidationError):
        schema.load(invalid_payload)


def test_feed_pet_increases_hunger_not_above_max(app, session, test_user, breeds):
    """
    Using the breed-specific interact() method with 'Feed' should increase
    HungerLevel but not exceed the maximum (assumed 100).
    """
    breed = breeds['Benshis']

    pet = PetsModel(
        Name='Snacky',
        UserId=test_user.Id,
        BreedId=breed.Id,
        HungerLevel=95,
    )
    session.add(pet)
    session.commit()

    pet = db.session.get(PetsModel, pet.Id)
    pet = as_breed_instance(pet) 

    before = pet.HungerLevel
    pet.interact('Feed')  

    assert pet.HungerLevel >= before 
    assert pet.HungerLevel <= 100     


def test_interaction_updates_last_interacted_with(app, session, test_user, breeds):
    """
    Any interaction (e.g., Play) should update the LastInteractedWith timestamp.
    """
    breed = breeds['Moomis']
    old_time = datetime.now(timezone.utc) - timedelta(days=7)

    pet = PetsModel(
        Name='Playful',
        UserId=test_user.Id,
        BreedId=breed.Id,
        LastInteractedWith=old_time,
    )
    session.add(pet)
    session.commit()

    pet = db.session.get(PetsModel, pet.Id)
    pet = as_breed_instance(pet)

    pet.interact('Play')

    assert pet.LastInteractedWith > old_time


def test_record_interaction_creates_row(app, session, test_user, breeds, actions):
    """
    Logging an interaction should create an InteractionsModel row linked
    to the pet and action.
    """
    breed = breeds['Pooshis']
    feed_action = actions['Feed']

    pet = PetsModel(
        Name='Hungry',
        UserId=test_user.Id,
        BreedId=breed.Id,
    )
    session.add(pet)
    session.commit()

    # Simulate logic from PetResource.put:
    pet = db.session.get(PetsModel, pet.Id)
    pet = as_breed_instance(pet)
    pet.interact(feed_action.Type)

    interaction = InteractionsModel(PetId=pet.Id, ActionId=feed_action.Id)
    session.add(interaction)
    session.commit()

    interactions_for_pet = db.session.query(InteractionsModel).filter_by(PetId=pet.Id).all()
    assert len(interactions_for_pet) == 1
    assert interactions_for_pet[0].ActionId == feed_action.Id


def test_user_cannot_have_more_than_six_pets(app, client, session, test_user, breeds, monkeypatch):
    """Creating a 7th pet via the API should return 400 and an error message."""
    breed = breeds['Benshis']

    class DummyUser:
        def __init__(self, Id):
            self.Id = Id

    monkeypatch.setattr(petResources, 'get_current_user', lambda: DummyUser(test_user.Id))

    # Seed 6 existing pets for this user
    for i in range(6):
        pet = PetsModel(
            Name=f'Pet{i}',
            UserId=test_user.Id,
            BreedId=breed.Id,
        )
        session.add(pet)
    session.commit()

    # Attempt to create a 7th pet through the HTTP API
    payload = {'Name': 'ExtraPet', 'UserId': test_user.Id, 'BreedType': 'Benshis'}
    url = f'/api/pets/{test_user.Id}'

    response = client.post(url, json=payload)

    assert response.status_code == 400
    data = response.get_json()
    assert 'cannot have more than 6 pets' in data['message']


def test_get_pets_for_user_returns_only_their_pets(app, client, session, test_user, other_user, breeds, monkeypatch):
    """GET /api/pets/<user_id> returns only that user's pets."""
    breed = breeds['Benshis']

    class DummyUser:
        def __init__(self, Id):
            self.Id = Id

    # Current user is test_user, so they should only see their own pets
    monkeypatch.setattr(petResources, 'get_current_user', lambda: DummyUser(test_user.Id))

    # Pets for test user
    pet1 = PetsModel(Name='UserPet1', UserId=test_user.Id, BreedId=breed.Id)
    pet2 = PetsModel(Name='UserPet2', UserId=test_user.Id, BreedId=breed.Id)

    # Pet for other user
    other_pet = PetsModel(Name='OtherPet', UserId=other_user.Id, BreedId=breed.Id)

    session.add_all([pet1, pet2, other_pet])
    session.commit()

    url = f'/api/pets/{test_user.Id}'
    response = client.get(url)

    assert response.status_code == 200
    data = response.get_json()
    names = sorted([p['Name'] for p in data])
    assert names == ['UserPet1', 'UserPet2']


def test_delete_pet_removes_pet_and_interactions(app, client, session, test_user, breeds, actions, monkeypatch):
    """DELETE /api/pet/<pet_id> removes the pet and its interactions."""
    breed = breeds['Benshis']
    hug_action = actions['Hug']

    class DummyUser:
        def __init__(self, Id):
            self.Id = Id

    # Current user is the owner
    monkeypatch.setattr(petResources, 'get_current_user', lambda: DummyUser(test_user.Id))

    # Create pet
    pet = PetsModel(Name='ToDelete', UserId=test_user.Id, BreedId=breed.Id)
    session.add(pet)
    session.commit()

    # Add an interaction
    interaction = InteractionsModel(PetId=pet.Id, ActionId=hug_action.Id)
    session.add(interaction)
    session.commit()

    url = f'/api/pet/{pet.Id}'
    response = client.delete(url)

    # Just check status code
    assert response.status_code == 204
    # Pet should be gone
    assert db.session.get(PetsModel, pet.Id) is None
    # Interactions should be deleted via cascade
    assert InteractionsModel.query.filter_by(PetId=pet.Id).count() == 0


def test_delete_pet_fails_for_wrong_owner(app, client, session, test_user, other_user, breeds, monkeypatch):
    """DELETE /api/pet/<pet_id> returns 403 when user does not own the pet."""
    breed = breeds['Moomis']

    class DummyUser:
        def __init__(self, Id):
            self.Id = Id

    # Pet belongs to test_user
    pet = PetsModel(Name='NotYours', UserId=test_user.Id, BreedId=breed.Id)
    session.add(pet)
    session.commit()

    # But current user is other_user
    monkeypatch.setattr(petResources, 'get_current_user', lambda: DummyUser(other_user.Id))

    url = f'/api/pet/{pet.Id}'
    response = client.delete(url)

    assert response.status_code == 403
    data = response.get_json()
    assert 'Unauthorized access to delete pet' in data['message']

    # Pet should still exist
    assert db.session.get(PetsModel, pet.Id) is not None
