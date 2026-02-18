# How This Project Meets Capstone Technical Requirements:
## Code including inheritance, polymorphism, and encapsulation
  ### Location (backend):
  * backend/models/Pet.py
  * backend/models/Breed.py
  ### How it’s implemented:
  #### Inheritance:
  * Benshis, Moomis, and Pooshis classes inherit from PetsModel, sharing core pet attributes and behavior.
  #### Polymorphism:
  * Each breed class overrides the interact() method. The same method call (e.g., pet.interact("Play")) produces different behavior depending on whether the pet is a Pooshis, Benshis, or Moomis.
  #### Encapsulation:
  * Pet state (such as _hungerLevel, _happinessLevel, _friendshipLevel, _lastInteractedWith) is stored in private fields and updated only through internal methods like _update_happiness, _update_hunger, and _update_friendship.
  * External code (routes/controllers) does not directly manipulate these fields; it calls the interact() method, which encapsulates the logic for updating internal state.

## Search functionality with multiple row results and displays
  ### Location (frontend/backend):
  * React pet list / dashboard component (e.g., frontend/src/pages/PetsList.tsx)
  * Corresponding API endpoint (e.g., GET /api/pets)
  ### How it’s implemented:
  * The application provides a pet listing view that displays multiple pets in a scrollable list.
  * Users can search, by pet name, or filter pets (by name, breed, and age) and see multiple matching results displayed at once.
  * The pet search feature retrieves the user’s pets once per page visit from the backend API, then performs all subsequent filtering on the client side. This reduces unnecessary network calls and improves responsiveness for the current expected data volume.

## A database component with the functionality to securely add, modify, and delete the data
  ### Location (backend):
  * SQLAlchemy models: Pet.py, Breed.py, Interaction.py, Action.py, User.py
  * Routes / resources for CRUD operations (e.g., POST /api/pets/<user_id>, PUT /api/pet/<pet_id>, DELETE /api/pet/<pet_id>)
  ### How it’s implemented:
    #### The application uses SQLAlchemy with a managed PostgreSQL database. Users can:
    * Add data: Create new pets with a specific breed and name.
    * Modify data: Pet details are updated through interactions (e.g., Feed, Play, Hug, Scold), which adjust internal stats such as hunger, happiness, and friendship. These changes are persisted in the database and visible in the UI. The backend also supports updating a pet’s name, and this rename capability is planned for a future UI iteration beyond the current MVP.
    * Delete data: Remove pets and automatically cascade-delete their interactions.
    * All database access is done via SQLAlchemy and environment-based connection strings, no raw queries with string concatenation, reducing the risk of SQL injection.

## Validation functionality
  ### Location (backend/frontend):
  * Backend: request validation via schemas and logic (e.g., Marshmallow schemas for pets/interactions, schemas are located in schemas/petSchema and schemas/userSchema)
  ### How it’s implemented:
  * Request payloads are validated so that only allowed actions and properly formatted fields (e.g., action types, pet names) are processed.
  * Invalid interaction actions or missing required fields return appropriate error responses (e.g., 400 Bad Request).

## Industry-appropriate security features
  ### Location:
  * backend configuration / environment variables
  * Auth0 integration (frontend + backend)
  * Render deployment settings
  ### How it’s implemented:
    #### Authentication & Authorization:
    * The application uses Auth0 for user authentication. Users must log in to access their pets and interact with the system.
    * Backend endpoints validate JWT access tokens to ensure that only authenticated users can perform actions.
    #### Secrets Management:
    * Sensitive values (database URL, Auth0 credentials) are stored in environment variables, not in source control.
    #### Transport Security:
    * The application is hosted on Render over HTTPS, which encrypts traffic between the user and the application.
    #### CORS and API Access:
    * CORS is configured to allow only the trusted frontend origin to call the backend API.
    #### All together, these choices reflect industry best practices for securing web applications.

## Design elements that make the application scalable
  ### Location:
  * Overall architecture: separate frontend and backend projects
  * Use of Docker for the backend
  * Cloud-hosted Postgres and Auth0 integration
  * Categorization of types for Interactions and Breeds
  ### How it’s implemented:
    #### Layered, service-oriented architecture:
    * The frontend (React) and backend (Flask API) are deployed as separate services, allowing each to scale independently.
    #### Containerization:
    * The backend is packaged in a Docker container, making it easier to deploy, scale, and move between environments.
    #### Cloud-managed services:
    * The database runs on a managed cloud service (via Render), and authentication is delegated to Auth0. This offloads heavy concerns and allows horizontal scaling as usage grows.
    #### Extensible domain model:
    * The design of pets, breeds, actions, and interactions allows new breeds or actions to be added without major structural changes.
    #### These choices support scaling the system for more users, more pets, and more interactions over time.

## A user-friendly, functional GUI
  ### Location (frontend):
  * React components and pages (e.g., src/pages, src/components)
  ### How it’s implemented:
    #### The frontend is a React single-page application with:
    * A clear navigation structure (home/dashboard, pet list, pet details, report view).
    * Dedicated screens for creating and interacting with pets.
    * Buttons and labels that use friendly, domain-specific language (“Feed,” “Play,” “Hug,” “Scold,” “Rename”).
    * Visual feedback and UI states:
    * Updated pet stats after actions.
    * Error messages when operations fail or inputs are invalid.
    * The interface is designed to be approachable and intuitive for users, requiring no deep technical knowledge to operate.

## Unit test scripts
  ### Location:
  * Backend tests (e.g., Backend/tests/)
  ### How it’s implemented:
  #### Unit tests are provided for core backend functionality, such as:
    * API endpoints (e.g., creating a pet, fetching pets, interacting with a pet).
    * Business logic related to pet interactions and state changes.
    * Tests are written using Python’s testing tooling (e.g., pytest)
    #### These tests verify that critical features work as expected and help prevent regressions during future changes.