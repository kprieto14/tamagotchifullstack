from db import db
from datetime import datetime, timezone

# This table logs interactions performed on pets, this can be used to track history or for analytics & build future features
# Such as counting a pet’s lifetime interactions, showing a “history” page, building future leaderboards, etc...
class InteractionsModel(db.Model):
    __tablename__ = 'Interaction'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    When = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    # Relationships
    ActionId = db.Column(db.Integer, db.ForeignKey('Action.Id'), nullable=False)
    action = db.relationship('ActionsModel', back_populates='interaction', uselist=False)

    PetId = db.Column(db.Integer, db.ForeignKey('Pet.Id'), nullable=False)
    pet = db.relationship('PetsModel', back_populates='interactions')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n when: {self.When}
                \n action type id: {self.ActionId}
                \n pet id: {self.PetId}
            >
        '''