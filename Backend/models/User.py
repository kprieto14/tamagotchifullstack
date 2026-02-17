from db import db
from datetime import datetime, timezone

class UsersModel(db.Model):
    __tablename__ = 'User'
    # DB Columns
    Id = db.Column(db.Integer, primary_key=True)
    Email = db.Column(db.String, nullable=False, unique=True)
    Username = db.Column(db.String, nullable=False, unique=True)
    AuthProvider = db.Column(db.String, nullable=False, default='auth0')
    AuthSubject = db.Column(db.String, nullable=False, unique=True)
    CreatedAt = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    # Relationships
    pets = db.relationship('PetsModel', back_populates='user', lazy='dynamic', cascade='all, delete')

    def __repr__(self):
        return f'''
            <
                \n id: {self.Id}
                \n email: {self.Email}
                \n user_name: {self.Username}
                \n auth_id: {self.AuthProvider}
                \n auth_subject: {self.AuthSubject}
                \n created_at: {self.CreatedAt}
            >
        '''

