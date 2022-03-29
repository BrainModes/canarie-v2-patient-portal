from db import db
from sqlalchemy.sql import func


class VendorInfoModel(db.Model):
    __tablename__ = 'vendor_information'
    id = db.Column(db.Integer, primary_key=True, index=True)
    vendor_name = db.Column(db.String(80), unique=True)
    shim_key = db.Column(db.String(80))
    client_id = db.Column(db.String(80))
    status = db.Column(db.String(80))

    def __init__(self, vendor_name, shim_key, client_id, status):
        self.vendor_name = vendor_name
        self.shim_key = shim_key
        self.client_id = client_id
        self.status = status

    def json(self):
        return {
            'vendor_name': self.vendor_name,
            'shim_key': self.shim_key,
            'client_id': self.client_id,
            'status': self.status
        }

    @classmethod
    def find_by_name(cls, vendor_name):
        db_records = db.query.filter_by(vendor_name=vendor_name)
        return cls.query.filter_by(vendor_name=vendor_name).first()

    def save_to_db(self):
        db.session.add(self)
        rec = db.session.commit()
        return rec

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()


class WearableDataModel(db.Model):
    __tablename__ = "wearables_data"
    id = db.Column(db.Integer, primary_key=True, index=True)
    container_guid = db.Column(db.String(80))
    username = db.Column(db.String(80))
    shimkey = db.Column(db.String(80))
    data_points = db.Column(db.String(80))
    date = db.Column(db.DateTime())
    value = db.Column(db.Integer())
    load_timestamp = db.Column(db.DateTime, default=func.now())
    unit = db.Column(db.String(80))
