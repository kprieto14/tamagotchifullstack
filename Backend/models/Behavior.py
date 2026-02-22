from db import db

class BehaviorsModel(db.Model):
    __tablename__ = 'Behavior'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    Message = db.Column(db.String, nullable=False)

    # Relationships
    BreedId = db.Column(db.Integer, db.ForeignKey('Breed.Id'), nullable=False)
    breed = db.relationship('BreedsModel', back_populates='behaviors')

    ActionId = db.Column(db.Integer, db.ForeignKey('Action.Id'), nullable=False)
    action = db.relationship('ActionsModel', back_populates='behaviors')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n message: {self.Message}
                \n breedId: {self.BreedId}
                \n actionId: {self.ActionId}
                \n breed: {self.breed}
                \n action: {self.action}
            >'''