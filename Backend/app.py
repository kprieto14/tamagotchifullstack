from flask import Flask
from flask_cors import CORS
from utils.ConfigCache import ConfigCache
from utils.auth0 import register_auth_error_handlers
from utils.database import configure_database
from utils.api import configure_api_settings
from resources import blueprints
import models

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, origins=[
            'http://localhost:5173', 
            'http://localhost:5174',
            'https://d424-software-engineering-capstone-1-uffc.onrender.com'
    ])

    # Initialize components
    migrate = configure_database(app)
    # with app.app_context():
    #     # Create cache for breeds/ behaviors/ actions
    #     ConfigCache.loadBreedInfo()
    api = configure_api_settings(app)

    # Register Auth0 error handler
    register_auth_error_handlers(app)

    # Register blueprints here
    api.register_blueprint(blueprints.PetBlueprint)
    api.register_blueprint(blueprints.UserBlueprint)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(port=5000)