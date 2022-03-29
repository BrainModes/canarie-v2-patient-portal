from flask import request, after_this_request
from flask_restx import Api, Resource, fields, reqparse
from flask_jwt import jwt_required
from config import ConfigClass
from module_keycloak.ops_admin import OperationsAdmin
from module_keycloak.ops_user import OperationsUser
from resources import api
from models.invitation import InvitationForm
from services.invitation_services.invitation_manager import SrvInvitationManager
from models.api_response import APIResponse, EAPIResponseCode
from resources.utils import neo4j_obj_2_json, node_2_json
from models.custom_exception import ValidationError
import json
import math
import requests
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship


class UpdateInvitationScript(Resource):
    '''
    This method update to invitations status to registered if users exist in neo4j.
    '''
    @jwt_required()
    def get(self):
        my_res = APIResponse()
        invitation_mgr = SrvInvitationManager()

        result = invitation_mgr.update_invitation_script()

        return my_res.response, my_res.code

