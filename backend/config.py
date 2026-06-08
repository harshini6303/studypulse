from pymongo import MongoClient

MONGO_URL = "mongodb+srv://saiharshinivemula4_db_user:Harsh%4015@cluster0.zyrry7h.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URL)

db = client["StudyPulseDB"]
questions_collection = db["questions"]