#!/usr/bin/env python3

""""
1. get list of all users authorized for fitbit account from neo4j
1. get today's date
2. check for missing dates within 7 days range(today - 1 week before date)
3. if any , call api for missing dates and save data
4. else call api for today's date and save data
"""
import logging, os
import pandas as pd
import pandas.errors
from py2neo import Graph
from py2neo.matching import RelationshipMatcher, NodeMatcher, CONTAINS
import datetime
import requests
from services.wearables_data_services.wearables_data import SrvWearablesData
_API_NAMESPACE = "fitbit_data_points"
_logger = logging.getLogger(_API_NAMESPACE)
ROOT_PATH = "/mnt/canarie/fitbit_data"
SHIMMER_BASE_URL = "http://10.3.9.242:8084"
FITBIT_SHIM_KEY = "fitbit"
NEO4J_URL = "bolt://10.3.9.205:7687"
NEO4J_USER = 'neo4j'
NEO4J_PASS = 'neo4j'

# ROOT_PATH = "/home/pcadmin/mnt/canarie/fitbit_data"

class CronFitbitData:
    def __init__(self):
        self.label = "step_count"
        self.shimkey = "fitbit"
        pass

    def data_ingestion(self):
        users_list = self.fetch_authorized_users()
        # users_list = [{'username': 'varsha', 'container_guid': ['abc']}]
        for user in users_list:
            self.fetch_data(user_info=user)

    def calculate_dates(self, username):
        """
        1. returns list of dates
        """
        # file_path = ROOT_PATH + f"/{username}.csv"
        file_path = f"{ROOT_PATH}/{username}.csv"
        dateEnd = datetime.datetime.today().date()
        dateStart = (datetime.datetime.now() - datetime.timedelta(days=30)).date()
        df = self.read_csv(username)
        if df is not None:
            pd.read_csv(file_path)
            df['date'] = pd.to_datetime(df['date'])
            my_range = pd.date_range(start=dateStart, end=dateEnd)
            list_dates = [ip_date.date() for ip_date in my_range.difference(df['date'])]
        else:
            print(f"Getting list of past week's dates")
            _logger.info(f"Getting list of past week's dates")
            list_dates = [(datetime.datetime.now() - datetime.timedelta(days=i)).date() for i in range(0, 7)]
        return list(list_dates)

    @staticmethod
    def read_csv(username):
        """
        check if csv exists with given username else create one
        """
        file_path = f"{ROOT_PATH}/{username}.csv"
        print(f"File path : {file_path}")
        _logger.info(f"File path : {file_path}")
        if not os.path.exists(file_path):
            columns = ['container_guid', 'username', 'shimkey', 'data_point', 'date', 'shimmer_response',
                       'load_timestamp']

            with open(file_path, 'a') as f:
                _logger.info(f"updating file permission")
                os.chmod(file_path, 0o777)
                _logger.info(f"successfully Created csv for user {username}")
        try:
            df = pd.read_csv(file_path)
            return df
        except pandas.errors.EmptyDataError as error:
            print(f"Empty data error while reading {username}.csv : {error}")
            _logger.error(f"Empty data error while reading {username}.csv : {error}")
            return None

    def fetch_data(self, user_info):
        """
        1. get list of dates
        2. make api calls for each date in the list
        3. for each api call :
            if data is not empty :
                3.a save_data_db
                3.b save_data_csv
            else:
                skip saving data
        """

        try:

            username = user_info.get('username')
            # TODO check if api call has to be made foe each container guid
            container_guid_list = user_info.get('container_guid', None)
            dates_list = self.calculate_dates(username)
            for date in dates_list:
                shimmer_payload = {
                    "normalize": True,
                    "username": username,
                    "dateStart": date,
                    "dateEnd": date,
                }
                is_data, shimmer_res = self.get_shimmer_data(shimmer_payload=shimmer_payload)
                if not is_data:
                    print(f"Error while trying to fetch shimmer data {shimmer_res}")
                    _logger.error(f"Error while trying to fetch shimmer data {shimmer_res}")
                else:
                    shimmer_result = shimmer_res.json()
                    if len(shimmer_result['body']) != 0:
                        print(f"Saving data for user in csv : {username}")
                        _logger.info(f"Saving data for user in csv : {username}")
                        # TODO check if container_guid is not None
                        if container_guid_list is not None:
                            for container_guid in container_guid_list:
                                is_data_saved = self.save_data_to_csv(username=username, shimmer_result=shimmer_result,
                                                                      container_guid=container_guid)
                                if is_data_saved:
                                    print(f"Data saved successfully for user in csv : {username} on date {date}")
                                    _logger.info(f"Data saved successfully for user in csv : {username} on date {date}")

                                print(f"Saving data to db for user : {username}")
                                _logger.info(f"Saving data to db for user : {username}")
                                is_data_saved_db = self.save_data_to_db(username=username,
                                                                        shimmer_result=shimmer_result,
                                                                        container_guid=container_guid)
                                if is_data_saved_db:
                                    print(f"Data saved successfully for user in csv : {username} on date {date}")
                                    _logger.info(f"Data saved successfully for user in csv : {username} on date {date}")
                        else:
                            print(f"No container guid found for user : {username}")
                            _logger.error(f"No container guid found for user : {username}")
                    else:
                        print(f"No data found for user {username} on date {date}")
                        _logger.info(f"No data found for user {username} on date {date}")
        except Exception as error:
            print(f"error while trying to save data: {error}")
            _logger.error(f"error while trying to save data: {error}")

    def get_shimmer_data(self, shimmer_payload):
        shimmer_req_url = SHIMMER_BASE_URL + f"/data/{FITBIT_SHIM_KEY}/{self.label}"
        shimmer_res = requests.get(shimmer_req_url, params=shimmer_payload)
        if shimmer_res.status_code != 200:
            print(f"Error while trying to fetch user data from shimmer {shimmer_res.json()}")
            _logger.error(f"Error while trying to fetch user data from shimmer {shimmer_res.json()}")
            return False, shimmer_res
        else:
            print(f"Successfully fetched data from shimmer for user {shimmer_payload.get('username')}")
            _logger.info(f"Successfully fetched data from shimmer for user {shimmer_payload.get('username')}")
            return True, shimmer_res

    def save_data_to_db(self, username, container_guid, shimmer_result):
        _logger.info(f"formatting data to be inserted in db")
        try:
            created_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            data_to_insert = [(container_guid,
                               username,
                               self.shimkey,
                               self.label,
                               data['body']['effective_time_frame']['time_interval']['start_date_time'],
                               data['body']['step_count'],
                               created_date,
                               "steps") for data in shimmer_result['body']]
            srvwearablesdata = SrvWearablesData()
            print(len(data_to_insert))
            if len(data_to_insert) != 0:
                srvwearablesdata.save_wearables_data(records=data_to_insert)
                return True
            # return True
        except Exception as error:
            print(f"Error while trying to format db data : {error}")
            _logger.error(f"Error while trying to format db data : {error}")
            return False

    @staticmethod
    def save_data_to_csv(container_guid, username, shimmer_result):
        """
        1. check if csv already exists
        2. if not, create one
        3. if yes, save data in username.csv
            3.a. data should be individual day's data
        """
        """method used to save shimmer response in csv file
                name of the csv file is same as username"""
        created_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file_path = ROOT_PATH + f'/{username}.csv'
        print(f"File path : {file_path}")
        _logger.info(f"File path : {file_path}")
        columns = ['container_guid', 'username', 'shimkey', 'data_point', 'date', 'shimmer_response', 'load_timestamp']
        try:
            for data in shimmer_result['body']:
                csv_data = {'container_guid': [container_guid],
                            'username': [username],
                            'shimkey': ['fitbit'],
                            'data_point': ['step_count'],
                            'date': (data['body']['effective_time_frame']['time_interval']['start_date_time']).split('T')[0], # splitting the str to store only the date (received as str from shimmer response)
                            'shimmer_response': [shimmer_result],
                            'load_timestamp': [created_date]
                            }
                _logger.info(f"saving data : {csv_data} in csv")
                df = pd.DataFrame(csv_data, columns=columns)

                with open(file_path, 'a') as f:
                    header = columns if f.tell() == 0 else False
                    df.to_csv(file_path, mode='a', index_label='id', index=True, header=header)
                    df.sort_values('date')
                    print(f"saved data in file")
                    _logger.info(f"saved data in file")
            # path_to_file = os.path.join(ConfigClass.NFS_ROOT_PATH, 'fitbit_data', 'varsha.csv')
            # hdr = False if os.path.isfile(file_path) else True

            # with open(r"/mnt/canarie/fitbit_data/varsha.csv", 'w+') as f:
            #     _logger.info(f"writing data in file"
            #     df.to_csv('/mnt/canarie/fitbit_data/varsha.csv', mode='a',index_label='id', index=True)
            return True
        except Exception as error:
            _logger.error(f"Error while writing data to csv : {error}")
            return False

    @staticmethod
    def fetch_authorized_users():
        """ Fetch list of authorized users from neo4j and save data for each user"""
        try:
            neo4j_client = Neo4jClient()
            user_node = neo4j_client.query_node("user", {"fitbit_status": "authorized"})
            user_json = [{'username': x['name'], 'container_guid': x['container_guid_guid']} for x in user_node]
            _logger.info(f"Saving data for users : total users : {user_json}")
            print(f"Saving data for users : total users : {user_json}")
            return user_json
        except Exception as error:
            print(f"Error while trying to fetch user list from neo4j : {error}")
            _logger.error(f"Error while trying to fetch user list from neo4j : {error}")


class Neo4jClient(object):

    def __init__(self):

        try:
            self.graph = Graph(
                NEO4J_URL,
                username=NEO4J_USER,
                password=NEO4J_PASS,
                max_connections=200,
            )
            self.nodes = NodeMatcher(self.graph)
            self.relationships = RelationshipMatcher(self.graph)
        except Exception as e:
            print("Error in __init__ connecting to Neo4j:" + str(e))

    def query_node(self, label, params=None, limit=None, skip=None, count=False, partial=False, order_by=None,
                   order_type=None):
        if partial:
            for key, value in params.items():
                if isinstance(value, str):
                    params[key] = CONTAINS(value)
                else:
                    params[key] = value
        if params:
            query = self.nodes.match(label, **params)
        else:
            query = self.nodes.match(label)

        if count:
            return query.count()
        if order_by:
            if order_type and order_type.lower() == "desc":
                order_by = f"_.{order_by} DESC"
            else:
                order_by = f"_.{order_by}"
            query = query.order_by(order_by)
        if limit:
            query = query.limit(limit)
        if skip:
            query = query.skip(skip)
        return query.all()


if __name__ == '__main__':
    cfd = CronFitbitData()
    # print(cfd.fetch_authorized_users())
    print(cfd.data_ingestion())

