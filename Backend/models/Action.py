from db import db

class ActionsModel(db.Model):
    __tablename__ = 'Action'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    Type = db.Column(db.String, nullable=False)
    # Play, Feed, Hug, Scold, Rename

    # Relationships
    interaction = db.relationship('InteractionsModel', back_populates='action', cascade='all, delete')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n name: {self.Type}
            >
        '''