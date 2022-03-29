from flask import request, send_file
from flask.helpers import safe_join, send_from_directory
from flask_restx import Api, Resource, fields, reqparse
from flask_jwt import jwt_required, current_identity

import os
import json
import re

from models.api_response import APIResponse, EAPIResponseCode
from models.user_type import EUserRoleContainer
from models.custom_exception import ValidationError
#from module_neo4j.ops_neo4j_base import Neo4jNode
from resources.decorator import check_site_role, check_role
from resources.utils import neo4j_obj_2_json, node_2_json
from resources import api
from config import ConfigClass
from resources.utils import helper_now_utc
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship


class FileProject(Resource):
    '''
    Set and get project properties that involves a file such as an icon.
    
    '''
    @jwt_required()
    @check_role("instance-admin")
    def get(self, dataset_id):
        print('get', os.getcwd())
        res = APIResponse()
        key = request.args.get('property', None)

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            if node is None:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            node_info = node_2_json(node)
            if key is None:
                res.set_result(f'{key} not found.')
                res.set_code(EAPIResponseCode.success)
            else:
                fname = node_info.get(key, None)
                
                if fname is None:
                    res.set_result(f"{key} not set. Please upload before retrieve it.")
                    res.set_code(EAPIResponseCode.internal_error)
                    return res.response, res.code
             
                return send_file(fname)

        except Exception as e:
            res.set_result(f"Failed retrieve file. {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("instance-admin")
    def post(self, dataset_id):
        print(os.getcwd())
        res = APIResponse()

        if 'file' not in request.files:
            res.set_result("No file part")
            return res.response, res.code
        post_file = request.files['file']
        post_data = json.load(request.files['data'])
        name, extension = os.path.splitext(post_data['file_name'])
        file_name = re.sub(r'\W+', '', name) + extension
        fname = f"project_{dataset_id}_property_{post_data['property']}_{file_name}"
        fname = safe_join(os.getcwd(), ConfigClass.UPLOAD_FOLDER, fname)
        post_file.save(fname)
        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            params = {post_data['property']: fname}
            neo4j_client.update_node(
                label=None, id=int(dataset_id), params=params)
            res.set_result(f"File {params} saved to container {dataset_id}")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed save file {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("instance-admin")
    def delete(self, dataset_id, key):
        res = APIResponse()

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            if node is None:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            node_info = node_2_json(node)
            fname = node_info.get(key, None)            
            if fname is None:
                res.set_result(f"{key} not set. Please upload before retrieve it.")
                res.set_code(EAPIResponseCode.internal_error)
                return res.response, res.code
            os.remove(fname)
            neo4j_client.delete_node_propery(int(dataset_id), key)
            res.set_result(f"Deleted {key} from container {dataset_id}.")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed delete property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code