# Flask Project Structure

This project follows the standard Flask project structure:

- app/: Main package of the application.
    - templates/: HTML templates.
    - static/: Static files like CSS, JavaScript.
    - __init__.py: Initializes the Flask application.
    - routes.py: Defines application routes.
    - models.py: Database models.
    - forms.py: Form classes for user input.

- migrations/: Directory for database migrations (managed by Flask-Migrate).

- tests/: Unit tests for the application.

- .env: Environment variables for the application.

- .flaskenv: Flask-specific environment variables.

- config.py: Configuration for the application (e.g., database details).

- README.md: Project description and instructions.

- pyproject.toml: Dependency file managed by Poetry.
