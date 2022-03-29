from flask_restx import Api, Resource, fields, reqparse
from models.api_response import APIResponse, EAPIResponseCode
from models.user_type import EUserRoleContainer
from models.custom_exception import ValidationError
from resources.decorator import check_site_role, check_role
from resources.utils import neo4j_obj_2_json, node_2_json, path_2_json
from flask_jwt import jwt_required, current_identity
from flask import request
from resources.utils import helper_now_utc
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship
import json
from services.notifier_services.email_service import SrvEmail

class Researchers(Resource):
    #@jwt_required()
    def get(self, dataset_id):
        '''
        Get Researchers in a study
        '''
        print("[INFO] Get Researchers in a study")
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
            if len(dataset) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            nodes = node_method.get_relation_with_params(start_label="user", end_label="study", end_params={ "id" : int(dataset_id)})
            result = []
            for x in nodes:
                json_node = neo4j_obj_2_json(x)
                ## only show with realtion property patient_portal with True in patient portal
                if(json_node['r']['type'] != 'patient' and json_node['r'].get("patient_portal", None) == True):
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




class ResearchersAppicable(Resource):

    def get(self, dataset_id):
        '''
        Get Applicable researchers for a study to be added to patient portal
        '''
        print("[INFO] Get Applicable users to be added to in a study")
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
            #print(dataset)
            if len(dataset) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            nodes = node_method.get_relation_with_params(start_label="user", end_label="study", end_params={ "id" : int(dataset_id)})
            # Get all users except with patient relation
            result = []
            for x in nodes:
                json_node = neo4j_obj_2_json(x)
                if (json_node['r']['type'] != 'patient'):
                    temp = json_node['start_node']
                    temp["permission"] = json_node['r']['type']
                    result.append(temp)

            #Remove duplicate users as users can have many relationships.
            seen_user = set()
            uniq_user = []
            for obj in result:
                if obj["id"] and obj["id"] not in seen_user:
                    uniq_user.append(obj)
                    seen_user.add(obj["id"])
            res.set_result(uniq_user)
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            print(e)
            res.set_result(f"Fail to find related users: {e}")
            res.set_code(EAPIResponseCode.internal_error)

        return res.response, res.code

    def post(self, dataset_id):
        '''
        Add Applicable researchers to a study in the patient portal
        '''
        print("[INFO] POST add users study")
        res = APIResponse()
        email_sender = SrvEmail()
        if not dataset_id:
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
            data = request.get_json()
            user = data.get("user")
            project_role =  data.get("role")
            # check if users exists
            user_node = node_client.query_node("user", {"name":user})
            user_json = [node_2_json(x) for x in user_node]
            if len(user_json) == 0:
                res.set_result("User does not exist on dataset")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            researcher = user_json[0]

            check_relation = node_client.get_relation(None, int(researcher["id"]), int(dataset_id))
            type = None
            for i in check_relation:
                type = next(iter(i.types()))

            if check_relation:
                check_relation = [{'p': path_2_json(check_relation[0]), 'r': {"type": type, "patient_portal": check_relation[0].get("patient_portal")}}]
            if (len(check_relation) != 0):
                relation = (check_relation[0]['r']['type'])
                if (check_relation[0]['r']['patient_portal'] == True):
                    res.set_result("Researcher is already has access to patient portal")
                    res.set_code(EAPIResponseCode.not_allowed)
                    return res.response, res.code
                # update relation property with patient_portal : true
                node_client.update_relation(None, project_role, int(researcher["id"]), int(dataset_id), {"patient_portal": True})
               
            else:
                node_client.add_relation_between_nodes(project_role, int(researcher["id"]), int(dataset_id), {"patient_portal": True})
            
            email_sender.send("Welcome to Canarie Patient Portal", "Hi " + str(researcher['username']) + " You have been added to the Study: "
            + "\r\n Study Name: " + str(dataset[0]['name'])
            + "\r\n Study Role: " + str(project_role),
            researcher['email'])

            res.set_result("Added user to patient portal")
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except Exception as e:
            print(e)
            res.set_result(f"Fail to find related users: {e}")
            res.set_code(EAPIResponseCode.internal_error)

    def delete(self, dataset_id):
        res = APIResponse()
        email_sender = SrvEmail()
        if not dataset_id:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        node_client = Neo4jClient()

        try: 
            data = request.get_json()
            user_id = data.get("user")
            permission = data.get("permission")

            result = node_client.update_relation(permission, permission, int(user_id), int(dataset_id), { "patient_portal": None })

            res.set_result("Remove user from project")
            res.set_code(EAPIResponseCode.success)

            return res.response, res.code

        except Exception as e:
            print(e)
            res.set_result(f"Fail to remove user: {e}")
            res.set_code(EAPIResponseCode.internal_error)

            return res.response, res.code