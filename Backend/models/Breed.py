import random
from models import PetsModel
from db import db

class BreedsModel(db.Model):
    __tablename__ = 'Breed'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    Type = db.Column(db.String, nullable=False)
    # Benshis, Moomis, Pooshis
    # Future iteration can add personality traits and other attributes that can be specific to a breed with user input

    # Relationships
    pets = db.relationship('PetsModel', back_populates='breed', cascade='all, delete')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n type: {self.Type}
            >
        '''

# Demonstrates polymorphism (overriding of interact method) and inheritance (inheriting Pet sub-class)
class Benshis(PetsModel):
    def interact(self, action, name=None):
        match action:
            case 'Play':
                self._update_happiness(random.randint(1, 10))
                self._update_friendship(random.randint(1, 5))
                return f'{self.Name} wags its tail happily!'
            case 'Feed':
                self._update_hunger(random.randint(1, 10))
                self._update_friendship(random.randint(1, 5))
                self._update_happiness(random.randint(1, 5))
                return f'{self.Name} enjoys a tasty treat!'
            case 'Scold':
                self._update_happiness(random.randint(-15, -1))
                self._update_friendship(random.randint(-15, -1))
                return f'{self.Name} looks sad.'
            case 'Hug':
                self._update_friendship(random.randint(1, 10))
                self._update_happiness(random.randint(1, 5))
                return f'{self.Name} licks your face affectionately!'
            case 'Rename':
                if name:
                    old_name = self.Name
                    self._rename(name)
                    return f'{old_name} is now known as {self.Name}!'
                return 'Rename action requires a new name.'
            case default:
                return f'{self.Name} looks around confused.'
# Demonstrates polymorphism (overriding of interact method) and inheritance (inheriting Pet sub-class)
class Moomis(PetsModel):
    def interact(self, action, name=None):
        match action:
            case 'Play':
                self._update_happiness(random.randint(1, 10))
                self._update_friendship(random.randint(1, 5))
                return f'{self.Name} is enjoying their TV!'
            case 'Feed':
                self._update_hunger(random.randint(1, 10))
                self._update_happiness(random.randint(1, 5))
                self._update_friendship(random.randint(1, 5))
                return f'{self.Name} purrs while eating!'
            case 'Scold':
                self._update_happiness(random.randint(-15, -1))
                self._update_friendship(random.randint(-15, -1))
                return f'{self.Name} looks unamused.'
            case 'Hug':
                self._update_friendship(random.randint(1, 10))
                self._update_happiness(random.randint(1, 5))
                return f'{self.Name} purrs happily!'
            case 'Rename':
                if name:
                    old_name = self.Name
                    self._rename(name)
                    return f'{old_name} is now renamed to {self.Name}!'
                return 'Rename action requires a new name.'
            case default:
                return f'{self.Name} looks around confused.'
# Demonstrates polymorphism (overriding of interact method) and inheritance (inheriting Pet sub-class)
class Pooshis(PetsModel):
    def interact(self, action, name=None):
        match action:
            case 'Play':
                self._update_happiness(random.randint(1, 10))
                self._update_friendship(random.randint(1, 5))
                return f'{self.Name} dances happily!'
            case 'Feed':
                self._update_hunger(random.randint(1, 10))
                self._update_friendship(random.randint(1, 5))
                self._update_happiness(random.randint(1, 5))
                return f'{self.Name} looks satisfied!'
            case 'Scold':
                self._update_happiness(random.randint(-15, -1))
                self._update_friendship(random.randint(-15, -1))
                return f'{self.Name} looks displeased.'
            case 'Hug':
                self._update_friendship(random.randint(1, 10))
                self._update_happiness(random.randint(1, 5))
                return f'{self.Name} snuggles in your lap!'
            case 'Rename':
                if name:
                    old_name = self.Name
                    self._rename(name)
                    return f'{old_name} is now named {self.Name}!'
                return 'Rename action requires a new name.'
            case default:
                return f'{self.Name} looks around confused.'