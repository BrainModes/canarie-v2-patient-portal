from models.service_meta_class import MetaService
from services.data_providers.bff_rds import SrvRDSSingleton
from config import ConfigClass


class SrvWearablesData(metaclass=MetaService):

    def __init__(self):
        self.rds_singleton = SrvRDSSingleton()
        self.rds_schema = ConfigClass.RDS_SCHEMA_DEFAULT
        self.table_full_name = "wearables_data"

    def save_wearables_data(self, records):

        values = ', '.join(map(str, records))
        save_query = "INSERT INTO {}" \
                     "(container_guid, username, shimkey, data_points, date, value, load_timestamp, unit) " \
                     "values {} RETURNING *".format(
            self.table_full_name,
            values
        )

        inserted = self.rds_singleton.simple_query(save_query)
        print(inserted)
        print('[Info]', len(inserted), 'Fitbit data Saved To Database')
        return inserted

    def get_wearables_data(self, column_name, value):
        read_query = "SELECT * FROM {} where {} = '{}'".format(
            self.table_full_name,
            column_name,
            value
        )
        db_records = self.rds_singleton.simple_query(read_query)
        print(db_records)
        return db_records
