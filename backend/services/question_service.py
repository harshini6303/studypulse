import random
from config import questions_collection

# Convert MongoDB ObjectId → string (VERY IMPORTANT)
def clean_question(q):
    q["_id"] = str(q["_id"])
    return q

def generate_test_questions(subject):
    # get all questions for that subject
    all_questions = list(questions_collection.find({"subject": subject}))

    # get all unique concepts (Arrays, Stack, etc.)
    concepts = list(set(q["concept"] for q in all_questions))

    easy_questions = []
    medium_questions = []
    hard_questions = []

    for concept in concepts:
        concept_questions = [q for q in all_questions if q["concept"] == concept]

        easy = [q for q in concept_questions if q["difficulty"] == "easy"]
        medium = [q for q in concept_questions if q["difficulty"] == "medium"]
        hard = [q for q in concept_questions if q["difficulty"] == "hard"]

        # take 2 from each difficulty (only if available)
        if len(easy) >= 2:
            easy_questions.extend(random.sample(easy, 2))

        if len(medium) >= 2:
            medium_questions.extend(random.sample(medium, 2))

        if len(hard) >= 2:
            hard_questions.extend(random.sample(hard, 2))

    # return clean JSON (NO ObjectId error)
    return {
        "easy": [clean_question(q) for q in easy_questions],
        "medium": [clean_question(q) for q in medium_questions],
        "hard": [clean_question(q) for q in hard_questions]
    }