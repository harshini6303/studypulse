from flask import Flask
from flask_cors import CORS
from routes.question_routes import question_bp

app = Flask(__name__)
CORS(app)

# 🔥 THIS LINE IS IMPORTANT
app.register_blueprint(question_bp)

if __name__ == "__main__":
    app.run(debug=True)