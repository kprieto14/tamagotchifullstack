# helper (e.g., services/breeds.py)
from models.Breed import Benshis, Moomis, Pooshis

BREED_CLASS = {
    "Benshis": Benshis,
    "Moomis": Moomis,
    "Pooshis": Pooshis,
}

def as_breed_instance(pet):
    cls = BREED_CLASS.get(pet.breed.Type)  
    if cls:
        pet.__class__ = cls
    return pet