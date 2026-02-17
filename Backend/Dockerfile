# Use the official image as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install PostgreSQL development packages, need this to install psycopg2 in requirements.txt
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    git \
    curl \
    telnet

# Copy the dependencies file to the working directory
COPY requirements.txt requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code to the working directory
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Flask env config
ENV FLASK_APP=app
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000
# Default to production mode unless overridden in docker-compose.yaml
ENV DEV_MODE=false

# if: Dev = container stays alive for VS Code
# else: Prod = Flask actually runs (Render)
CMD ["sh", "-c", "if [ \"$DEV_MODE\" = \"true\" ]; then \
    echo 'Running in DEV_MODE - container idle'; \
    tail -f /dev/null; \
else \
    echo 'Running in PROD_MODE - starting Flask'; \
    python -m flask run; \
fi"]
