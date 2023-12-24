# HoT_SkillTracker

## About
This application is a skill tracker for the game "Halls of Torment", facilitating build tracking.

## Installation with Poetry
1. Clone the repository: `git clone https://github.com/gizix/HoT_SkillTracker.git`
2. Install Poetry if not already installed: `pip install poetry`
3. Navigate to the project directory: `cd HoT_SkillTracker`
4. Install dependencies with Poetry: `poetry install --no-root`

## Running the Application
1. Activate the Poetry environment: `poetry shell`
2. Set environment variables: `export FLASK_APP=app`
3. Run the server: `flask run`
4. Access the application at `localhost:5000` in your browser.

## Features
- **Skill Tracking**: Manage and view your game builds.
- **Profile Management**: Save and retrieve your profiles directly in the browser.

## How It Works
- **Saving Profiles**: Utilizes browser local storage to save user profiles for quick access.
- **Backend**: Built with Flask, handling routing and server-side logic.
- **Frontend**: Interactive UI built with HTML, CSS, and JavaScript.

## Contributing
Contributions are welcome. Please fork the repository and submit a pull request.

## License
[MIT License](LICENSE)
