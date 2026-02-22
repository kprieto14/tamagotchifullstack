from db import db

class ConfigCache:
    # Should act as private variables, only accessed by returning values in getBreedInfo
    _behaviors = { }
    _breeds = []
    _actions = []

    # Create a constants from the DB that the application can use once without having to constantly re-call the DB
    @classmethod
    def loadBehaviors(cls):
        from models import BehaviorsModel
        behaviors = BehaviorsModel.query.order_by(BehaviorsModel.Id.asc()).all()
        cache = { }
        for behavior in behaviors:
            # Get a previously created pet with its actions in dict otherwise create a new one to work with
            oldPet = cache.get(behavior.breed.Type, { })
            newBehavior = {
                **oldPet,
                behavior.action.Type: behavior.Message 
            }
            cache[behavior.breed.Type] = {
                **oldPet,
                **newBehavior
            }
        cls._behaviors = cache

    @classmethod
    def loadBreedsOnly(cls):
        from models import BreedsModel
        cls._breeds = BreedsModel.query.order_by(BreedsModel.Id.asc()).all()

    @classmethod
    def loadActionsOnly(cls):
        from models import ActionsModel
        cls._actions = ActionsModel.query.order_by(ActionsModel.Id.asc()).all()

    @classmethod
    def loadCache(cls):
        print('Loading cache')
        cls.loadBehaviors()
        cls.loadBreedsOnly()
        cls.loadActionsOnly()
        print('Cache loaded')
        print('Behaviors loaded:', cls._behaviors)
        print('Breeds loaded:', cls._breeds)
        print('Actions loaded:', cls._actions)

    @classmethod
    def getInfo(cls, infoNeeded='Load'):
        match infoNeeded:
            case 'Behaviors':
                return cls._behaviors
            case 'Breeds':
                return cls._breeds
            case 'Actions':
                return cls._actions
            case 'Load':
                return cls.loadCache()
            case default:
                return 'Invalid string passed, no information returned'