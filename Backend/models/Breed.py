from models import PetsModel
from db import db
# Look up table
class BreedsModel(db.Model):
    __tablename__ = 'Breed'
    Id = db.Column(db.Integer, primary_key=True)
    Type = db.Column(db.String, nullable=False, unique=True)
    # Benshis, Moomis, Pooshis

    # Relationships
    pets = db.relationship('PetsModel', back_populates='breed', cascade='all, delete')
    behaviors = db.relationship('BehaviorsModel', back_populates='breed', cascade='all, delete')

    def __repr__(self):
        return f'''
            <
                \n Id: {self.Id}
                \n Type: {self.Type}
            >'''