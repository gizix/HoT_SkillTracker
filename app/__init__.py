from flask import Flask, render_template, request, jsonify
from pathlib import Path
import webview
import json
import os
import sys

app = Flask(__name__)
app.config['DEBUG'] = False
window = webview.create_window('HoT Skill Tracker', app)


def get_file_path(filename):
    """Get the correct file path for the given filename."""
    if getattr(sys, 'frozen', False):
        # The application is frozen
        # Save to user's home directory or another persistent directory
        datadir = Path.home() / '.your_app_name'  # Change '.your_app_name' to your application's name
        datadir.mkdir(exist_ok=True)  # Create the directory if it doesn't exist
    else:
        # The application is not frozen
        datadir = Path(__file__).parent
    return datadir / filename


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ability_traits')
def ability_traits():
    return render_template('ability_traits.html')


@app.route('/save_states', methods=['POST'])
def save_states():
    new_state = request.json
    file_path = get_file_path('states.json')
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                existing_states = json.load(file)
        else:
            existing_states = {}

        existing_states.update(new_state)

        with open(file_path, 'w') as file:
            json.dump(existing_states, file)
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))


@app.route('/load_states', methods=['GET'])
def load_states():
    try:
        file_path = get_file_path('states.json')
        if not os.path.exists(file_path):
            return jsonify({})  # Return an empty object if file doesn't exist

        with open(file_path, 'r') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        return jsonify(success=False, error=str(e))


if __name__ == '__main__':
    # app.run(debug=True)
    webview.start(debug=False)
