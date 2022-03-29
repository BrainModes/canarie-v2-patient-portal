from db import db
class StudyModel(db.Model):
    __tablename__ = 'project'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    description = db.Column(db.String(80))
    location = db.Column(db.String(80))
    recruitment_status =  db.Column(db.String(80))
    disease = db.Column(db.String(80))
    investigator = db.Column(db.String(80))
    keywords = db.Column(db.String(80))

    def __init__(self, name, description, location, recruitment_status, disease, investigator, keywords):
        self.name = name
        self.description = description
        self.location = location
        self.recruitment_status = recruitment_status
        self.disease = disease
        self.investigator = investigator
        self.keywords = keywords

    def json(self):
        return {
            'name': self.name, 
            'description': self.description,
            'location':self.location,
            'recruitment_status':self.recruitment_status,
            'disease':self.disease,
            'investigator':self.investigator,
            'keywords':self.keywords}

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter_by(name=name).first()

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()