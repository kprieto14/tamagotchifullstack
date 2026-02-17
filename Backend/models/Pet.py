from db import db
from datetime import datetime, timezone

class PetsModel(db.Model):
    __tablename__ = 'Pet'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String, nullable=False)
    Birthday = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    HungerLevel = db.Column(db.Integer, nullable=False, default=0)
    HappinessLevel = db.Column(db.Integer, nullable=False, default=0)
    FriendshipLevel = db.Column(db.Integer, nullable=False, default=0)
    LastInteractedWith= db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    IsDead = db.Column(db.Boolean, nullable=False, default=False)
    # Future interation to include method to check last interaction date to determine pet 'death'

    # Relationships
    UserId = db.Column(db.Integer, db.ForeignKey('User.Id'), nullable=False)
    user = db.relationship('UsersModel', back_populates='pets')

    BreedId = db.Column(db.Integer, db.ForeignKey('Breed.Id'), nullable=False)
    breed = db.relationship('BreedsModel', back_populates='pets', uselist=False)

    interactions = db.relationship('InteractionsModel', back_populates='pet', cascade='all, delete')

    # Keep Happiness within -50 - 100 range
    def _update_happiness(self, amount):
        self.HappinessLevel = max(-50, min(100, self.HappinessLevel + amount))
        self.LastInteractedWith = datetime.now(timezone.utc)
    # Keep Hunger within 0 - 100 range
    def _update_hunger(self, amount):
        self.HungerLevel = max(0, min(100, self.HungerLevel + amount))
        self.LastInteractedWith = datetime.now(timezone.utc)
    # Keep Friendship within -50 - 100 range
    def _update_friendship(self, amount):
        self.FriendshipLevel = max(-50, min(100, self.FriendshipLevel + amount))
        self.LastInteractedWith = datetime.now(timezone.utc)
    # Rename pet (not currently routed in front-end, to achieve MVP this will be added in future iteration)
    def _rename(self, new_name):
        self.Name = new_name

    # Polymorphism to allow interactions to be overriden and specific by class
    def interact(self, action):
        raise NotImplementedError('Breeds must implement this method')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n name: {self.Name}
                \n birthday: {self.Birthday}
                \n hunger level: {self.HungerLevel}
                \n happiness level: {self.HappinessLevel}
                \n friendship level: {self.FriendshipLevel}
                \n last interaction date: {self.LastInteractedWith}
                \n is dead: {self.IsDead}
                \n user id: {self.UserId}
                \n breed id: {self.BreedId}
            >
        '''