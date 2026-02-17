import os

def connection_string():
    # Use full URL from Render for production
    INTERNAL_PROD_URL = os.getenv('INTERNAL_PROD_URL')
    if INTERNAL_PROD_URL:
        return INTERNAL_PROD_URL

    # Fallback for local development with .env file
    DATABASE_HOST = os.getenv('DATABASE_HOST')
    DATABASE_USER = os.getenv('DATABASE_USER')
    DATABASE_PW = os.getenv('DATABASE_PW')
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    DATABASE_PORT = os.getenv('DATABASE_PORT')
    return(f'postgresql://{DATABASE_USER}{DATABASE_PW}:@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}')