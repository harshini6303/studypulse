from flask import Blueprint, jsonify
from pymongo import MongoClient
from bson import ObjectId
import random

question_bp = Blueprint("questions", __name__)

client = MongoClient("mongodb://localhost:27017/")
db = client["exam_db"]
collection = db["questions"]

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@question_bp.route("/questions/<subject>")
def get_questions(subject):
    subject = subject.upper()

    all_questions = list(collection.find({"subject": subject}))
    

    # group by concept
    concept_map = {}
    for q in all_questions:
        concept = q.get("concept", "Unknown")
        concept_map.setdefault(concept, []).append(q)

    final_questions = []

    for concept, qs in concept_map.items():
        easy   = [q for q in qs if q.get("difficulty") == "easy"]
        medium = [q for q in qs if q.get("difficulty") == "medium"]
        hard   = [q for q in qs if q.get("difficulty") == "hard"]

        # safety: if any bucket < 2, fallback to random from qs
        if len(easy) < 2 or len(medium) < 2 or len(hard) < 2:
            picked = random.sample(qs, min(6, len(qs)))
        else:
            picked = (
                random.sample(easy, 2) +
                random.sample(medium, 2) +
                random.sample(hard, 2)
            )

        final_questions.extend(picked)

    random.shuffle(final_questions)

    # serialize ObjectId
    final_questions = [serialize(q) for q in final_questions]

    return jsonify(final_questions)