from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ability_traits')
def ability_traits():
    return render_template('ability_traits.html')


if __name__ == '__main__':
    app.run(debug=True)
