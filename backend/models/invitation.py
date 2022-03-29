from db import db
from config import ConfigClass

class InvitationForm:
    _form = {
        'email': '', ## by default success
        'projectId': -1, ## empty when success
        'role': '',
    }
    def __init__(self, event = None):
        if event:
            self._form = event
    @property
    def form_dict(self):
        return self._form
    @property
    def email(self):
        return self._form['email']
    @email.setter
    def email(self, email):
        self._form['email'] = email
    @property
    def project_id(self):
        return self._form['projectId']
    @project_id.setter
    def project_id(self, project_id):
        self._form['projectId'] = project_id
    @property
    def role(self):
        return self._form['role']
    @role.setter
    def role(self, role):
        self._form['role'] = role

class InvitationModel(db.Model):
    __tablename__ = 'user_invitation'
    __table_args__ = {"schema": "public"}
    id = db.Column(db.Integer, unique=True, primary_key=True)
    is_active = db.Column(db.Boolean())
    invitation_code = db.Column(db.String())
    invitation_detail = db.Column(db.String())
    expiry_timestamp = db.Column(db.DateTime())
    create_timestamp = db.Column(db.DateTime())
    email = db.Column(db.String())
    role = db.Column(db.String())
    project = db.Column(db.String())
    question = db.Column(db.String())
    answer = db.Column(db.String())
    status = db.Column(db.String())

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def to_dict(self):
        result = {}
        field_list = [
            "id",
            "is_active",
            "invitation_code",
            "invitation_detail",
            "expiry_timestamp",
            "create_timestamp",
            "email",
            "role",
            "project",
            "question",
            "answer",
            "status",
        ]
        for field in field_list:
            result[field] = getattr(self, field)
        return result 