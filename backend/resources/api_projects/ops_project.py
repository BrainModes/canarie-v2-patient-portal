from flask_restx import Api, Resource, fields, reqparse
from models.api_response import APIResponse, EAPIResponseCode
from models.user_type import EUserRoleContainer
from models.custom_exception import ValidationError
#from module_neo4j.ops_neo4j_base import Neo4jNode
from resources.decorator import check_site_role, check_role
from resources.utils import neo4j_obj_2_json, node_2_json
from flask_jwt import jwt_required, current_identity
from flask import request
from resources import api
from config import ConfigClass
import json
import re
from resources.utils import helper_now_utc
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship


class DatasetsAdmin(Resource):

    @jwt_required()
    @check_site_role("instance-admin")
    def post(self, id, relation):
        '''
        crerate a container
        '''
        post_data = request.get_json()
        metadatas = post_data.get("metadatas", {})
        dataset_name = post_data.get("name", None)
        dateset_type = post_data.get("type", None)
        admin_name = post_data.get("admin", None)
        title = metadatas.get("title", None)
        user_id = current_identity['uid']
        res = APIResponse()
        if not dataset_name or not dateset_type or not user_id or not title or not admin_name:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        if not re.match("^[a-z]+[a-z0-9]*$", dataset_name):
            res.set_result(
                "dateset name can only includes lowercase letter, number and start with lowercase letter")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        metadatas.update({'parent_id': int(id)})
        metadatas.update({'parent_relation': relation})

        node_client = Neo4jClient()
        neo4j_method = Neo4jRelationship()

        try:
            target_node = node_client.query_node(
                dateset_type, {"name": dataset_name})
            target_node_result = [node_2_json(x) for x in target_node]
            if len(target_node_result) != 0:
                res.set_result(
                    f"{dateset_type} with provided name already exist")
                res.set_code(EAPIResponseCode.conflict)
                return res.response, res.code
            admin_node = node_client.query_node(
                label='user', params={"name": admin_name})
            admin_node_result = [node_2_json(x) for x in admin_node]

            if len(admin_node_result) == 0:
                res.set_result(f"User {admin_name} doesn't exist in database")
                res.set_code(EAPIResponseCode.not_found)
                return res.response, res.code
            else:
                admin_id = admin_node_result[0]["id"]
            if dateset_type == "study":
                tools = metadatas.get("tools", None)
                node = node_client.add_node(
                    dateset_type, dataset_name, metadatas)
                result = [node_2_json(node)]
                node_client.add_relation_between_nodes(
                    "admin", admin_id, int(result[0]["id"]))
                if "pdg" in tools:
                    pdg_node = node_client.add_node("pdg", dataset_name)
                    pdg_result = [node_2_json(x) for x in pdg_node]
                    node_client.add_relation_between_nodes(
                        "admin", admin_id, pdg_result[0]["id"])
                    res.set_result({
                        "node": result,
                        "pdg_node": pdg_result})
                else:
                    res.set_result({
                        "node": result})
            else:
                node = node_client.add_node(
                    dateset_type, dataset_name, metadatas)
                result = [node_2_json(node)]
                node_client.add_relation_between_nodes(
                    "admin", admin_id, result[0]["id"])
                res.set_result({
                    "node": result})
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except Exception as e:
            res.set_result(f"Failed to create container: {e}")
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code

    @jwt_required()
    @check_site_role("instance-admin")
    def get(self, id, relation):
        '''
        get containers list
        '''
        start = request.args.get('start', True)
        level = request.args.get('level', None)
        res = APIResponse()
        neo4j_method = Neo4jRelationship()
        if not id or not relation:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        try:
            node = neo4j_method.get_node_along_relation(
                relation, int(id), start)
            result = [neo4j_obj_2_json(x).get('node') for x in node]
            print(result)
            res.set_result({"node": result})
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except Exception as e:
            res.set_result(f"Failed to create container: {e}")
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class Datasets(Resource):
    @jwt_required()
    def get(self):
        res = APIResponse()
        neo4j_method = Neo4jRelationship()
        neo4j_client = Neo4jClient()
        user_id = current_identity['uid']
        relation_label = request.args.get('relation', None)
        role = current_identity['role']
        if role[0] == 'instance-admin':
            node = neo4j_client.query_node_exclude_label('user')
            result = [neo4j_obj_2_json(x).get('node') for x in node]
            res.set_result({"node": result})
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        relation_list = json.loads(relation_label)
        if not user_id or not relation_list:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        relation = '|:'.join(relation_list)
        print(relation)
        try:
            node = neo4j_method.get_node_along_relation(
                relation, int(user_id), start=True)
            result = [neo4j_obj_2_json(x).get('node') for x in node]

            res.set_result({"node": result})
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Fail to find related containers: {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class DatasetUserOperation(Resource):
    @jwt_required()
    @check_role("admin")
    def post(self, dataset_id):
        post_data = request.get_json()
        email = post_data.get("email", None)
        relation = post_data.get("relation", None)
        res = APIResponse()
        if not email or not dataset_id or not relation:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        # if relation not in EUserRoleContainer.__members__:
        #     res.set_result("User type does not exist")
        #     res.set_code(EAPIResponseCode.bad_request)
        #     return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node(None, int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            user_node = neo4j_client.query_node("user", {"email": email})
            user_node_result = [node_2_json(x) for x in user_node]
            if len(user_node_result) == 0:
                res.set_result("User with given email address not found")
                res.set_code(EAPIResponseCode.not_found)
                return res.response, res.code
            user_node_id = user_node_result[0]["id"]
            user_role = user_node_result[0]["role"]
            if user_role == "instance-admin":
                res.set_result(
                    "Instance admin default has admin privileges for all project")
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            if user_role == "patient":
                res.set_result(
                    "Can not add user with role patient to researcher portal")
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            neo4j_client.add_relation_between_nodes(
                None, int(user_node_id), int(dataset_id))
            res.set_result(f"Successfully linked users to given container")
            res.set_code(EAPIResponseCode.success)
        except ValidationError as e:
            res.set_result(f"Failed to link users with given container. {e}")
            res.set_code(EAPIResponseCode.forbidden)
        except Exception as e:
            res.set_result(
                f"Unable to link user {email} to given container because of {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def get(self, dataset_id):
        '''
        Get users in a container for researcher portal
        '''
        print("[INFO]--- GET USERS IN DATASET")
        res = APIResponse()
        relation_label = request.args.get('relation', None)
        relation_list = json.loads(relation_label)
        if not dataset_id or not relation_label:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        node_client = Neo4jClient()
        node_method = Neo4jRelationship()
        try:
            dataset_node = node_client.get_node(None, int(dataset_id))
            dataset = [node_2_json(dataset_node)]
            if len(dataset) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            relation = '|:'.join(relation_list)
            node = node_method.get_node_along_relation(
                relation, int(dataset_id), start=False)
            neo4j_json = [neo4j_obj_2_json(x).get("node") for x in node]
            print(node)
            print(neo4j_json)
            res.set_result(neo4j_json)
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            print(e)
            res.set_result(f"Fail to find related users: {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class DatasetProperty(Resource):
    '''
    Set and get property in the key:value format.
    E.g., add redcap token and retrieve token when needed        
    '''
    @jwt_required()
    @check_role("admin")
    def get(self, dataset_id):
        res = APIResponse()
        key = request.args.get('key', None)
        if key is None:
            res.set_result("Please provide key to query.")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            if node is None:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            node_info = node_2_json(node)
            token = node_info.get(key, None)

            if token is None:
                res.set_result(f"{key} not set.")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            res.set_result({key: token})
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed set property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def post(self, dataset_id):
        res = APIResponse()

        key = request.args.get('key', None)
        value = request.args.get('value', None)
        if None in [key, value]:
            res.set_result("Please provide key, value to set.")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            neo4j_client.update_node(label=None, id=int(
                dataset_id), params={key: value})
            res.set_result(
                f"Added property {key}:{value} to container {dataset_id}")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed set property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class DatasetProperties(Resource):
    '''
    Set and get properties for a dataset.
    Properties should be passed and returned as a json format
    '''
    @jwt_required()
    @check_role("admin")
    def get(self, dataset_id):
        res = APIResponse()
        key = request.args.get('key', None)

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            if node is None:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            node_info = node_2_json(node)
            if key is None:
                res.set_result(node_info)
                res.set_code(EAPIResponseCode.success)
            else:
                token = node_info.get(key, None)

                if token is None:
                    res.set_result(f"{key} not set.")
                    res.set_code(EAPIResponseCode.not_allowed)
                    return res.response, res.code

                res.set_result({key: token})
                res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed set property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def post(self, dataset_id):
        res = APIResponse()

        post_data = request.get_json()
        print(post_data)

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            neo4j_client.update_node(
                label=None, id=int(dataset_id), params=post_data)
            res.set_result(f"Added properties to container {dataset_id}")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed set property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def delete(self, dataset_id, key):
        res = APIResponse()

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node('study', int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            print(key)
            neo4j_client.delete_node_propery(int(dataset_id), key)
            res.set_result(f"Deleted {key} from container {dataset_id}.")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed delete property {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class DatasetTest(Resource):
    # for testing purpose only
    def get(self):
        print("[INFO]---  DatasetTest")
        node_client = Neo4jClient()
        node_method = Neo4jRelationship()
        # node = node_method.add_relation_between_nodes_with_properties("patient", 58, 20, {"status": 'approved', "join_date": helper_now_utc().isoformat()})

        node = node_method.update_relation_with_properties(
            "Patient", "Researcher", 253, 20, {"status": 'denied'})


class DiscoverableDataSets(Resource):
    def get(self):
        node_client = Neo4jClient()
        res = APIResponse()

        try:
            nodes = node_client.query_node(
                'study', params={"discoverable": True})
            result = [node_2_json(x) for x in nodes]

            res.set_result(result)
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed get discoverable datasets {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code
