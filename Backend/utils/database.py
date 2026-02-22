from flask import Flask
from flask_migrate import Migrate
from db import db
from utils.ConfigCache import ConfigCache
from utils.connection import connection_string

def configure_database(app: Flask) -> Migrate:
    DATABASE_URI = connection_string()

    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    try:
        db.init_app(app)
        print("Database connected")
        
        with app.app_context():
            try:
                db.create_all()
                # Create cache for behaviors/ breeds/ actions
                ConfigCache.getInfo()
                print("Database tables created")
            except Exception as e:
                print("Error creating database tables")
                print(e)
                
    except Exception as e:
        print("Error connecting to database")
        print(e)

    return Migrate(app, db)