import datetime
import json
from json import JSONEncoder

import pandas as pd
import requests
from flask import request
from flask_restx import Resource

from commons.service_logger.logger_factory_service import SrvLoggerFactory
from config import ConfigClass
from models.api_response import APIResponse, EAPIResponseCode
from models.model_vendor_info import WearableDataModel, db
from resources.utils import object_as_dict
from services.wearables_data_services.wearables_data import SrvWearablesData

_API_NAMESPACE = "fitbit_data_points"

_logger = SrvLoggerFactory(_API_NAMESPACE).get_logger()


class FitbitDataPoints(Resource):
    def post(self, label):
        res = APIResponse()
        try:
            post_data = request.get_json()
            # db_query = db.session.query(WearableDataModel)
            # fn to validate mandatory params in payload

            shimmer_payload = {
                "normalize": True,
                "username": post_data.get('username'),
                "dateStart": post_data.get('dateStart'),
                "dateEnd": post_data.get('dateEnd'),
            }
            shimmer_req_url = ConfigClass.SHIMMER_BASE_URL + f"/data/{ConfigClass.FITBIT_SHIM_KEY}/{label}"
            shimmer_res = requests.get(shimmer_req_url, params=shimmer_payload)
            if shimmer_res.status_code != 200:
                res.set_code(EAPIResponseCode.internal_error)
                res.set_result(f"Error while fetching data from shimmer {shimmer_res.json()['message']}")
                return res.response
            else:
                shimmer_result = shimmer_res.json()
                srvwearablesdata = SrvWearablesData()
                data_to_insert = self.form_db_insert_data(post_data, shimmer_result, label)
                if len(data_to_insert) == 0:
                    res.set_result(f"No data found for user : {post_data['username']} on {post_data.get('dateStart')}")
                    return res.response

                data_inserted = srvwearablesdata.save_wearables_data(records=data_to_insert)
                _logger.info(f"Saving data for user in db: {post_data['username']}")

                self.save_data_to_csv(post_data, shimmer_result)
                # save data in csv under that username

                res.set_result(f"Data saved succesfully for user : {post_data['username']}")
                return res.response
        except Exception as error:
            res.set_code(EAPIResponseCode.internal_error)
            res.set_result(f"error while trying to save data: {error}")
            return res.response

    @staticmethod
    def form_db_insert_data(post_data, shimmer_result, label):
        created_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        data_to_insert = [(post_data['container_guid'],
                           post_data['username'],
                           "fitbit",
                           label,
                           data['body']['effective_time_frame']['time_interval']['start_date_time'],
                           data['body']['step_count'],
                           created_date,
                           "steps") for data in shimmer_result['body']]
        return data_to_insert

    def validate_request_payload(self, post_data):
        pass

    def save_data_to_csv(self, post_data, shimmer_response):
        """method used to save shimmer response in csv file
        name of the csv file is same as username"""
        created_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        columns = ['container_guid', 'username', 'shimkey', 'data_point', 'insertion_date', 'shimmer_response']
        try:
            data = {'container_guid': [post_data.get('container_guid')],
                    'username': [post_data.get('username')],
                    'shimkey': ['fitbit'],
                    'data_point': ['step_count'],
                    'insertion_date': [created_date],
                    'shimmer_response': [shimmer_response]
                    }
            username = post_data.get('username')
            _logger.info(f"saving data : {data} in csv")
            df = pd.DataFrame(data, columns=columns)
            df.to_csv(f'/mnt/canarie/fitbit_data/{username}.csv', mode='a', index_label='id', index=True)
            _logger.info(f"saved data in file")
            # path_to_file = os.path.join(ConfigClass.NFS_ROOT_PATH, 'fitbit_data', 'varsha.csv')
            # with open(r"/mnt/canarie/fitbit_data/varsha.csv", 'w+') as f:
            #     _logger.info(f"writing data in file")
            #     df.to_csv('/mnt/canarie/fitbit_data/varsha.csv', mode='a',index_label='id', index=True)
        except Exception as error:
            _logger.error(f"Error while writing data to csv : {error}")
            return error

    """ API to fetch data based on label"""

    def get(self, label):
        res = APIResponse()
        username = request.args.get('username')
        try:
            db_query = db.session.query(WearableDataModel)
            # fields = [WearableDataModel.username, WearableDataModel.data_points, WearableDataModel.shimkey,
            # WearableDataModel.date, WearableDataModel.value]
            db_records = db_query.filter_by(username=username)
            query_result = [convert_rec_to_json(rec) for rec in db_records]
            res.set_result(query_result)
            res.set_code(EAPIResponseCode.success)
            return res.response
        except Exception as error:
            res.set_code(EAPIResponseCode.internal_error)
            res.set_result(f"error while trying to fetch data from shimmer : {error}")
            return res.response


# subclass JSONEncoder
class DateTimeEncoder(JSONEncoder):
    # Override the default method
    def default(self, obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()


def convert_rec_to_json(rec):
    """ fn converts datetime to json compatible and
     returns jsonified db records for each row"""
    return json.loads(DateTimeEncoder().encode(object_as_dict(rec)))



