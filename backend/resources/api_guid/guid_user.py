from flask import request, after_this_request
from flask_restx import Api, Resource, fields, reqparse
from config import ConfigClass
from resources import userApi as api
from resources.utils import neo4j_obj_2_json, node_2_json
from module_neo4j.py2neo import Neo4jClient
import requests
import json
import re

class GUIDUser(Resource):
    # Retrieve user GUID by user id, set if not exist
    ################################################################# Swagger
    payload = api.model(
        "User GUID payload", {
            "realm": fields.String(readOnly=True, description='realm'),
            "id": fields.String(readOnly=True, description='user id')
        }
    )
    sample_return = api.model(
        "guid", {
            "id": fields.String(readOnly=True, description='guid'),
        }
    )
    #################################################################
    @api.expect(payload)
    @api.response(200, sample_return)
    def get(self): 
        # validate payload
        post_data = request.get_json()
        realm = post_data.get('realm', 'canarie')
        user_id = post_data.get('id', None)

        if realm is None or realm not in ConfigClass.KEYCLOAK.keys():
            return {'result': 'invalid realm'}, 400
        
        if user_id is None:
            return {'result': 'Please provide user id.'}, 400

        # create admin client
        try:
            node_client = Neo4jClient()
            user_node = node_client.graph.nodes.get(user_id)
            user_node_result = node_2_json(user_node)
            guid = user_node_result.get('guid', None)
            if guid is None:
                print(f"set guid for user f{user_id}")
                res = requests.get(f'{ConfigClass.GUID_URL}/token12/{user_id}')
                guid = res.json()[f'{user_id}']
                node_client.update_node(label=None, id=user_id, params={'guid': guid})
            print("get guid: ", guid)
        except Exception as e:
            return {'result': 'Internal error: {}'.format(e)}, 500

       
        return {'guid': guid}, 200