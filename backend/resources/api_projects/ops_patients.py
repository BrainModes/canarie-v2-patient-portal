from imp import IMP_HOOK
import imp
from flask_restx import Api, Resource, fields, reqparse
from models.api_response import APIResponse, EAPIResponseCode
from models.custom_exception import ValidationError
from resources.decorator import check_site_role, check_role
from resources.utils import neo4j_obj_2_json, node_2_json
from flask_jwt import jwt_required, current_identity
from flask import request
from resources import api
from resources.utils import helper_now_utc
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship
import json
from resources.logger import Logger
from config import ConfigClass
import os
import requests
logging = Logger(name=f'{os.path.basename(__file__)[:-3]}.log')

class Patients(Resource):
    # @jwt_required()
    def get(self, dataset_id):
        '''
        Get Patients or Researchers in a study
        '''
        print("[INFO] Get Patients in a study")
        res = APIResponse()
        if not dataset_id:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        node_client = Neo4jClient()
        node_method = Neo4jRelationship()
        try:
            dataset_node = node_client.get_node(None, int(dataset_id))
            dataset = [node_2_json(dataset_node)]
            print(dataset)
            if len(dataset) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            nodes = node_method.get_relation_with_params(
                relation_label="patient", start_label="user", end_label="study", end_params={"id": int(dataset_id)})
            result = []
            for x in nodes:
                json_node = neo4j_obj_2_json(x)
                temp = json_node['start_node']
                temp["permission"] = json_node['r']['type']
                result.append(temp)
            res.set_result(result)
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            print(e)
            res.set_result(f"Fail to find related users: {e}")
            res.set_code(EAPIResponseCode.internal_error)

        return res.response, res.code


class ListUsers(Resource):
    '''
    Get users from given conditions
    '''

    def retrieve_users(self, dataset_id):
        neo4j_client = Neo4jClient()
        node_method = Neo4jRelationship()

        dataset_node = neo4j_client.get_node(None, int(dataset_id))
        dataset = [node_2_json(dataset_node)]
        if len(dataset) == 0:
            return [], None

        nodes = node_method.get_relation_with_params(
            start_label="user", end_label="study", end_params={"id": int(dataset_id)})
        # Get all users except with patient relation
        result = []
        for x in nodes:
            json_node = neo4j_obj_2_json(x)
            if (json_node['r']['type'] != 'patient'):
                temp = json_node['start_node']
                temp["permission"] = json_node['r']['type']
                result.append(temp)

        # Remove duplicate users as users can have many relationships.
        seen_user = set()
        uniq_user = []
        for obj in result:
            if obj["id"] and obj["id"] not in seen_user:
                obj.pop('confirm')
                obj.pop('password')
                uniq_user.append(obj)
                seen_user.add(obj["id"])
        return dataset, uniq_user

    @jwt_required()
    @check_role("instance-admin")
    def get(self, dataset_id):
        res = APIResponse()
        relation = request.args.get('relation', None)

        neo4j_client = Neo4jClient()
        node_method = Neo4jRelationship()
        try:
            if relation:
                # need to fix the sister relation in database later
                relation = 'parent' if relation == 'sister' else relation
                node = node_method.get_node_along_relation(
                    relation, int(dataset_id), start=False)
                result = [neo4j_obj_2_json(x).get('node') for x in node]
                if len(result) == 0:
                    res.set_result("Container ID not exist.")
                    res.set_code(EAPIResponseCode.not_allowed)
                    return res.response, res.code
                dataset_id = result[0].get('id')

            dataset, uniq_user = self.retrieve_users(dataset_id)

            if len(dataset) == 0:
                res.set_result(f"Dataset {dataset_id} not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            res.set_result(uniq_user)
            res.set_code(EAPIResponseCode.success)

        except ValidationError as e:
            res.set_result(f"Failed to retrieve users. {e}")
            res.set_code(EAPIResponseCode.forbidden)
        except Exception as e:
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class CheckUserRedCapSurvey(Resource):
    '''
    Check users's REDCap survey
    '''

    def post(self):
        res = APIResponse()
        post_data = request.get_json()

        survey_id = post_data.get('survey_id', None)
        study_id = post_data.get('study_id', None)

        if not survey_id:
            res.set_result("Missing required survey_id")
            res.set_code(EAPIResponseCode.bad_request)

        if not study_id:
            res.set_result("Missing required study_id")
            res.set_code(EAPIResponseCode.bad_request)

        node_client = Neo4jClient()
        dataset_node = node_client.get_node(None, int(study_id))
        dataset = [node_2_json(dataset_node)]
        if len(dataset) == 0:
            res.set_result("Dataset not exists")
            res.set_code(EAPIResponseCode.not_allowed)
            return res.response, res.code

        study_info = dataset[0]
        if 'redap_token' not in study_info:
            res.set_result("This study is not connect with REDCap")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        data = {
            'token': study_info['redap_token'],
            'content': 'record',
            'format': 'json',
            'records[0]': survey_id,
            'returnFormat': 'json'
        }

        url = ConfigClass.REDCAP_URL 
        redcap_res = requests.post(url, data=data)

        res.set_result(redcap_res.json())

        if redcap_res.status_code == 200:
            res.set_code(EAPIResponseCode.success)

        return res.response, res.code


class GetUserRedCapSurveyQueueLink(Resource):
    '''
    Get users's REDCap survey link
    '''

    def post(self):
        res = APIResponse()
        post_data = request.get_json()

        survey_id = post_data.get('survey_id', None)
        study_id = post_data.get('study_id', None)

        if not survey_id:
            res.set_result("Missing required survey_id")
            res.set_code(EAPIResponseCode.bad_request)

        if not study_id:
            res.set_result("Missing required study_id")
            res.set_code(EAPIResponseCode.bad_request)

        node_client = Neo4jClient()
        dataset_node = node_client.get_node(None, int(study_id))
        dataset = [node_2_json(dataset_node)]
        if len(dataset) == 0:
            res.set_result("Dataset not exists")
            res.set_code(EAPIResponseCode.not_allowed)
            return res.response, res.code

        study_info = dataset[0]
        if 'redap_token' not in study_info:
            res.set_result("This study is not connect with REDCap")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        data = {
            'token': study_info['redap_token'],
            'content': 'surveyQueueLink',
            'format': 'json',
            'record': survey_id,
            'returnFormat': 'json'
        }

        url = ConfigClass.REDCAP_URL
        redcap_res = requests.post(url, data=data)

        res.set_result(redcap_res.text)

        if redcap_res.status_code == 200:
            res.set_code(EAPIResponseCode.success)

        return res.response, res.code


class GetUserRedCapSurveyLink(Resource):
    '''
    Get users's REDCap survey link
    '''

    def post(self):
        res = APIResponse()
        post_data = request.get_json()

        survey_id = post_data.get('survey_id', None)
        study_id = post_data.get('study_id', None)

        if not survey_id:
            res.set_result("Missing required survey_id")
            res.set_code(EAPIResponseCode.bad_request)

        if not study_id:
            res.set_result("Missing required study_id")
            res.set_code(EAPIResponseCode.bad_request)

        node_client = Neo4jClient()
        dataset_node = node_client.get_node(None, int(study_id))
        dataset = [node_2_json(dataset_node)]
        if len(dataset) == 0:
            res.set_result("Dataset not exists")
            res.set_code(EAPIResponseCode.not_allowed)
            return res.response, res.code

        study_info = dataset[0]
        if 'redap_token' not in study_info:
            res.set_result("This study is not connect with REDCap")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        data = {
            'token': study_info['redap_token'],
            'content': 'surveyLink',
            'format': 'json',
            'record': survey_id,
            'returnFormat': 'json',
            'instrument': 'subject_informed_econsent',
            'event': 'event_1_arm_1'
        }

        url = ConfigClass.REDCAP_URL
        redcap_res = requests.post(url, data=data)

        res.set_result(redcap_res.text)

        if redcap_res.status_code == 200:
            res.set_code(EAPIResponseCode.success)

        return res.response, res.code


class GetSurveyCompleteStatus(Resource):
    '''
    Get users's REDCap surveys complete status
    '''

    def get(self):
        res = APIResponse()
        url = ConfigClass.REDCAP_URL
        study_id = request.args.get('study_id', None)
        if not study_id:
            res.set_result("Missing required study_id")
            res.set_code(EAPIResponseCode.bad_request)

        node_client = Neo4jClient()
        dataset_node = node_client.get_node(None, int(study_id))
        dataset = [node_2_json(dataset_node)]
        if len(dataset) == 0:
            res.set_result("Dataset not exists")
            res.set_code(EAPIResponseCode.not_allowed)
            return res.response, res.code

        study_info = dataset[0]
        if 'redap_token' not in study_info:
            res.set_result("This study is not connect with REDCap")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        logging.info(f"redap_token: {study_info['redap_token']}")
        data_survey = {
            'token': study_info['redap_token'],
            'content': 'instrument',
            'format': 'json',
            'returnFormat': 'json',
        }
        
        redcap_surveys_res = requests.post(url, data=data_survey)
        redcap_survey_data = redcap_surveys_res.json()
        logging.info(f"redcap_survey_data: {redcap_survey_data}")
        surveys_map = { redcap_survey_data[i]["instrument_name"]: redcap_survey_data[i]["instrument_label"] for i in range(0, len(redcap_survey_data))}
        surveys_map.pop("subject_enrollment_and_econsent_configuration", None)
        surveys_map.pop("econsent_review", None)
        logging.info(f"surveys_map: {surveys_map}")
        if not surveys_map:
            res.set_result("Can not find Redcap surveys in this study")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        maps = [x + '_complete' for x in surveys_map.keys()]
        logging.info(f"maps: {maps}")
        result = ['econsent', 'record_id'] + maps
        actual_fields = ','.join(result)
        data = {
            'token': study_info['redap_token'],
            'content': 'record',
            'format': 'json',
            'returnFormat': 'json',
            'fields': actual_fields
        }
        
        redcap_res = requests.post(url, data=data)
        redcap_data = redcap_res.json()

        results = []
        if isinstance(redcap_data, dict) and 'error' in redcap_data:
            res.set_result(redcap_data['error'])
            res.set_code(EAPIResponseCode.unauthorized)
            return res.response, res.code

        for item in redcap_data:
            record_info = {
                "record_id": item['record_id'],
                "is_survey_started": True
            }
            uncompleted_surveys = []
            if 'econsent' in item:
                if item['econsent'] == '1':
                    for key, value in item.items():
                        if '_complete' in key and value != '2':
                            survey_key = key[:-9]
                            uncompleted_surveys.append(surveys_map[survey_key])
                else:
                    record_info["is_survey_started"] = False
            else:
                record_info["is_survey_started"] = False

            record_info['uncompleted_surveys'] = uncompleted_surveys
            results.append(record_info)

        res.set_result(results)

        return res.response, res.code
