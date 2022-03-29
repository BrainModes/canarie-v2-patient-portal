import requests
from collections import defaultdict
import os
from flask import request
from flask_restx import Api, Resource, fields
from requests.api import post
from requests.sessions import Request
from resources.decorator import check_site_role, check_role
from flask_jwt import jwt_required
from keycloak import exceptions
from config import ConfigClass
from module_keycloak.ops_admin import OperationsAdmin
# from module_neo4j.ops_neo4j_base import Neo4jNode
from resources.utils import neo4j_obj_2_json, node_2_json
from resources import api
from models.api_response import APIResponse, EAPIResponseCode
import json
from module_neo4j.py2neo import Neo4jClient
from services.notifier_services.email_service import SrvEmail
from models.user_type import EUserRoleContainer
from services.invitation_services.invitation_manager import SrvInvitationManager
from commons.service_logger.logger_factory_service import SrvLoggerFactory

_API_NAMESPACE = "ops_admin"

_logger = SrvLoggerFactory(_API_NAMESPACE).get_logger()

class AddUser(Resource):
    # create a new user
    ##############################################################swagger
    query_payload = api.model(
        "create_user", {
            "realm": fields.String(readOnly=True, description='realm'),
            "username": fields.String(readOnly=True, description='username'),
            "password": fields.String(readOnly=True, description='password'),
            "email": fields.String(readOnly=True, description='email'),
            "firstname": fields.String(readOnly=True, description='firstname'),
            "lastname": fields.String(readOnly=True, description='lastname'),
            "role": fields.String(readOnly=True, description="this is the role")
        }
    )
    post_sample_return = '''
    {
        "result": "9be8141b-3596-4c3e-a93c-951b1d1975a6"
    }
    '''
    #############################################################
    role_list = ['container-requester', 'registered-user', 'instance-admin', 'patient']
    parser = api.parser()

    # parser.add_argument('Authorization', location='headers')
    @api.expect(query_payload)
    @api.response(200, post_sample_return)
    def post(self):
        '''
        add a user to the platform
        '''
        try:
            res = APIResponse()
            invitation_mgr = SrvInvitationManager()
            post_data = request.get_json()
            print(post_data)
            realm = post_data.get('realm', None)
            username = post_data.get('username', None)
            password = post_data.get('password', None)
            email = post_data.get('email', None)
            firstname = post_data.get('firstname', None)
            lastname = post_data.get('lastname', None)
            role = post_data.get('role', None)

            if not realm or not realm in ConfigClass.KEYCLOAK.keys():
                res.set_result('Invalid realm')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code

            if not role or role not in self.role_list:
                res.set_result('Invalid user type')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code

            operations_admin = OperationsAdmin(realm)

            if not username or not password or not email or not firstname or not lastname or not role:
                res.set_result('Missing required information')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code

            userid = operations_admin.get_user_id(username)
            if userid is not None:
                res.set_result('User already existed in platform')
                res.set_code(EAPIResponseCode.conflict)
                return res.response, res.code

            user = operations_admin.create_user(
                username,
                password,
                email,
                firstname,
                lastname,
                role
            )

            guid = requests.get(
                f'{ConfigClass.GUID_URL}/2keys/canarie_guid?userid={userid}&projid=canarie')  # -1 for platform
            print(guid.json())
            post_data['guid'] = guid.json()['guid']
            # unfortunately hashmap is not allow for properties. use two lists for each guid types.
            post_data['container_guid_container'] = []
            post_data['container_guid_guid'] = []
            post_data['foreign_guid_container'] = []
            post_data['foreign_guid_platform'] = []
            post_data['foreign_guid_guid'] = []
            print(json.dumps(post_data))
            print('creating user neo4j ...')
            node_client = Neo4jClient()
            node = node_client.add_node('user', username, post_data)
            print('creating user neo4j done.')
            result = [node_2_json(node)]

            res.set_result(result)
            res.set_code(EAPIResponseCode.success)
            print("created user is : " + user)
            ## update invitation link
            invitation_mgr.register(email)
            ## email to user after registration
            email_sender = SrvEmail()
            subject = 'Welcome to the CANARIE Patient Portal!'
            info = {
                'user_name': firstname
            }
            email_sender.send_html("patient_onboard.html", info, subject, [email])
            return res.response, res.code
        except exceptions.KeycloakGetError as err:
            err_code = err.response_code
            error_msg = json.loads(err.response_body)
            return {"result": str(error_msg)}, err_code
        except Exception as e:
            raise
            res.set_result(f'User created failed : {e}')
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class ListUser(Resource):
    # create a new user
    # create user
    ##############################################################swagger
    query_payload = api.model(
        "list_user", {
            "realm": fields.String(readOnly=True, description='realm'),
        }
    )
    post_sample_return = '''
    {
        "result": []
    }
    '''
    #############################################################
    parser = api.parser()
    parser.add_argument('Authorization', location='headers')

    @api.expect(query_payload)
    @api.response(200, post_sample_return)
    @jwt_required()
    @check_site_role('instance-admin')
    def get(self, realm):
        '''
        get a list of users on the platform
        '''
        try:
            res = APIResponse()
            # get the header and get the logged in user's role
            user_list = []
            operations_admin = OperationsAdmin(realm)
            users = operations_admin.list_user({})
            if users:
                for user in users:
                    user_info = {
                        'username': user['username'],
                        'enabled': user['enabled'],
                        'firstname': user['firstName'],
                        'lastname': user['lastName'],
                        'email': user['email'],
                        'role': user['attributes'].get('user_role'),
                        **user

                    }

                    user_list.append(user_info)
                res.set_result(user_list)
                res.set_code(EAPIResponseCode.success)
            else:
                res.set_result('No user in keycloak')
                res.set_code(EAPIResponseCode.not_found)
            return res.response, res.code
        except Exception as e:
            res.set_result(f'Error when retriving user list: {e}')
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class GetUserByUsername(Resource):
    # Look up user
    ##############################################################swagger
    query_payload = api.model(
        "get_user_by_name_or_email", {
            "realm": fields.String(readOnly=True, description='realm', required=True),
            "username": fields.String(readOnly=True, description='username'),
            "email": fields.String(readOnly=True, description='email')
        }
    )
    post_sample_return = '''
    {
        "result": {}
    }
    '''
    #############################################################
    parser = api.parser()
    parser.add_argument('Authorization', location='headers')

    @api.expect(query_payload)
    @api.response(200, post_sample_return)
    @jwt_required()
    # @check_site_role('instance-admin')
    def post(self):
        '''
        a lookup api that takes email or user name, returns the user information if he exist on the platform
        '''
        try:
            res = APIResponse()
            post_data = request.get_json()
            realm = post_data.get('realm', None)
            username = post_data.get('username', None)
            email = post_data.get('email', None)
            operations_admin = OperationsAdmin(realm)
            node_client = Neo4jClient()

            user_neo4j_info = None

            if not username and not email:
                res.set_result('Missing required information')
                res.set_code(EAPIResponseCode.bad_request)
            elif username is not None:
                userid = operations_admin.get_user_id(username)
                user = operations_admin.get_user_info(userid)
                user_neo4j = node_client.query_node('user', params={"name": username})
                if len(user_neo4j):
                    user_neo4j_info = user_neo4j[0]
            else:
                users = operations_admin.list_user({'email': email})
                user_neo4j = node_client.query_node('user', params={"email": email})
                if users:
                    user = users[0]
                    if len(user_neo4j):
                        user_neo4j_info = user_neo4j[0]
                else:
                    res.set_result({})
                    res.set_code(EAPIResponseCode.success)
                    return res.response, res.code
            if user_neo4j_info:
                user_neo4j_info = [node_2_json(user_neo4j_info)]
            user_info = {
                'username': user['username'],
                'enabled': user['enabled'],
                'firstname': user['firstName'],
                'lastname': user['lastName'],
                'email': user['email'],
                'role': user['attributes'].get('user_role')
            }
            if user_neo4j_info:
                user_info = {
                    **user_info,
                    **user_neo4j_info[0]
                }
            res.set_result(user_info)
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code
        except exceptions.KeycloakGetError as err:
            if err.response_code == 404:
                res.set_result({})
                res.set_code(EAPIResponseCode.success)
            else:
                res.set_result(f'query user by its name failed: {e}')
                res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code
        except Exception as e:
            res.set_result(f'query user by its name failed: {e}')
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class UserActions(Resource):
    # Actions on user(s) : delete, re-activate
    ##############################################################swagger
    query_payload = api.model(
        "user_in_realm", {
            "realm": fields.String(readOnly=True, description='realm'),
            "users": fields.List(fields.String, readOnly=True, description='username')
        }
    )
    post_sample_return = '''
    {
        "result": {
            "successed_list": ["username1"],
            "failed_list": [
                "username2",
                "username3"
            ]
        }
    }
    '''
    #############################################################
    role_list = ['container-requester', 'registered-user', 'instance-admin']
    parser = api.parser()

    # parser.add_argument('Authorization', location='headers')
    @api.expect(query_payload)
    @api.response(200, post_sample_return)
    @jwt_required()
    @check_site_role('instance-admin')
    def delete(self):
        '''
        Delete user(s) from the platform
        '''
        try:
            res = APIResponse()
            post_data = request.get_json()
            user_list = post_data.get('users', None)
            realm = post_data.get('realm', None)
            if len(user_list) == 0:
                res.set_result('You need to provide at least one user')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            failed_list = []
            success_list = []
            operations_admin = OperationsAdmin(realm)
            for user in user_list:
                try:
                    user_id = operations_admin.get_user_id(user)
                    result = operations_admin.update_user(user_id, {'enabled': False})
                    if not result:
                        success_list.append(user)
                except exceptions.KeycloakGetError:
                    failed_list.append(user)
                    res.set_error_msg('user not exists')
                    continue
            res.set_result({'successed_list': success_list,
                            'failed_list': failed_list})
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result('internal server error: ' + str(e))
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code
        #############################################################

    @api.expect(query_payload)
    @api.response(200, post_sample_return)
    @jwt_required()
    @check_site_role('instance-admin')
    def put(self):
        '''
        Acticate suspended user(s) from the platform
        '''
        try:
            res = APIResponse()
            post_data = request.get_json()
            user_list = post_data.get('users', None)
            realm = post_data.get('realm', None)
            if len(user_list) == 0:
                res.set_result('You need to provide at least one user')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            failed_list = []
            success_list = []
            operations_admin = OperationsAdmin(realm)
            for user in user_list:
                try:
                    user_id = operations_admin.get_user_id(user)
                    result = operations_admin.update_user(user_id, {'enabled': True})
                    if not result:
                        success_list.append(user)
                except exceptions.KeycloakGetError:
                    failed_list.append(user)
                    res.set_error_msg('user not exists')
                    continue
            res.set_result({'successed_list': success_list,
                            'failed_list': failed_list})
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result('internal server error: ' + str(e))
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class AssignUserRole(Resource):
    '''
    unfinished
    assign user a new role 
    
    '''

    @jwt_required()
    @check_role("admin")
    def put(self, dataset_id, user_id):
        res = APIResponse()
        relation = request.args.get('relation', None)
        email_sender = SrvEmail()
        print(EUserRoleContainer.__members__)
        if not relation:
            res.set_result("Missing required information")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code
        if relation not in EUserRoleContainer.__members__:
            res.set_result("Role does not exist")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node(None, int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            # neo4j_client.delete_relation(18, 276 )
            # neo4j_client.add_relation_between_nodes(relation, int(dataset_id), int(user_id) )

            user_node = neo4j_client.get_node(None, int(user_id))
            user_info = [node_2_json(user_node)]

            if len(user_info) == 0:
                res.set_result("User not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            neo4j_client.update_relation(None, relation, int(user_id), int(dataset_id), {"patient_portal": True})

            email_sender.send("Permission Change Notification!", "Hi " + user_info[0]['username'] + "," +
                              "\nYour permission has been changed :"
                              + "\r\n\nContainer name: " + str(result[0]['name'])
                              + "\r\n\nNew Permission: " + str(relation)
                              + "\r\n\nThis notification is automatically generated by the Patient Data Gateway please contact help@pdg.ca if you require assistance.",
                              user_info[0]['email'])

            res.set_result(f"Assigned user as {relation}")
            res.set_code(EAPIResponseCode.success)

        except Exception as e:
            res.set_result(f"Failed to assign role {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def delete(self, dataset_id, user_id):
        res = APIResponse()

        email_sender = SrvEmail()

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node(None, int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code
            relation = neo4j_client.delete_relation(int(dataset_id), int(user_id))

            user_node = neo4j_client.get_node(None, int(user_id))
            user_info = [node_2_json(user_node)]

            if len(user_info) == 0:
                res.set_result("User not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            email_sender.send("Permission Remove Notification!", "Hi " + user_info[0]['username'] + "," +
                              "\nYour permission has been removed :"
                              + "\r\n\nContainer name: " + str(result[0]['name'])
                              + "\r\n\nThis notification is automatically generated by the Patient Data Gateway please contact help@pdg.ca if you require assistance.",
                              user_info[0]['email'])

            res.set_result(f"Removed relation {relation}")
            res.set_code(EAPIResponseCode.success)

        except Exception as e:
            res.set_result(f"Failed to assign role {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class NeoUsers(Resource):
    def get(self):
        try:
            res = APIResponse()
            node_client = Neo4jClient()
            admin_node = node_client.query_node(label='user', params={"role": "registered-user"})
            admin_node_result = [node_2_json(x) for x in admin_node]

            res.set_result(admin_node_result)
            res.set_code(EAPIResponseCode.success)
            return res.response, res.code

        except Exception as e:
            res.set_result(f'User fetch failed : {e}')
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code


class AddForeignID(Resource):
    '''
    Add a ID from foreign platform such as REDCap
        
    '''

    @jwt_required()
    @check_role("admin")
    def post(self, dataset_id):
        res = APIResponse()
        user_id = request.args.get('user_id', None)
        platform = request.args.get('platform', None)
        platform_user_id = request.args.get('platform_user_id', None)
        if None in [dataset_id, user_id, platform, platform_user_id]:
            res.set_result("Please provide dataset_id, user_id, platform, and patform_id")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node(None, int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            user_node = neo4j_client.get_node(None, int(user_id))
            if user_node is None:
                res.set_result("User not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            user_info = node_2_json(user_node)
            foreign_container = user_info.get('foreign_guid_container', [])
            foreign_platform = user_info.get('foreign_guid_platform', [])
            foreign_guid = user_info.get('foreign_guid_guid', [])
            params = {'foreign_guid_container': [dataset_id],
                      'foreign_guid_platform': [platform],
                      'foreign_guid_guid': [platform_user_id]
                      }
            for a, b, c in zip(foreign_container, foreign_platform, foreign_guid):
                if a == dataset_id and b == platform: continue
                params['foreign_guid_container'].append(a)
                params['foreign_guid_platform'].append(b)
                params['foreign_guid_guid'].append(c)

            neo4j_client.update_node(label=None, id=int(user_id), params=params)
            res.set_result(f"Added {platform} ID {platform_user_id} for user {user_id}.")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed to add ID {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code

    @jwt_required()
    @check_role("admin")
    def delete(self, dataset_id):
        '''
        Delete a user's foreign ID given user_id, platform, and the dataset_id
        '''
        res = APIResponse()
        user_id = request.args.get('user_id', None)
        platform = request.args.get('platform', None)
        if None in [dataset_id, user_id, platform]:
            res.set_result("Please provide dataset_id, user_id, platform")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response, res.code

        neo4j_client = Neo4jClient()
        try:
            node = neo4j_client.get_node(None, int(dataset_id))
            result = [node_2_json(node)]
            if len(result) == 0:
                res.set_result("Dataset not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            user_node = neo4j_client.get_node(None, int(user_id))
            if user_node is None:
                res.set_result("User not exists")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            user_info = node_2_json(user_node)
            foreign_container = user_info.get('foreign_guid_container', [])
            foreign_platform = user_info.get('foreign_guid_platform', [])
            foreign_guid = user_info.get('foreign_guid_guid', [])
            params = defaultdict(list)
            IDFound = False
            for a, b, c in zip(foreign_container, foreign_platform, foreign_guid):
                if a == dataset_id and b == platform:
                    IDFound = True
                    continue
                params['foreign_guid_container'].append(a)
                params['foreign_guid_platform'].append(b)
                params['foreign_guid_guid'].append(c)

            if not IDFound:
                res.set_result(f"{platform} ID not found for user {user_id}")
                res.set_code(EAPIResponseCode.not_allowed)
                return res.response, res.code

            neo4j_client.update_node(label=None, id=int(user_id), params=params)
            res.set_result(f"Deleted {platform} ID from user {user_id}.")
            res.set_code(EAPIResponseCode.success)
        except Exception as e:
            res.set_result(f"Failed to delete ID {e}")
            res.set_code(EAPIResponseCode.internal_error)
        return res.response, res.code


class UpdateUserInfo(Resource):
    def put(self, user_id):
        """ update user info in neo4j after successful authorization"""
        res = APIResponse()
        post_data = request.get_json()
        state = post_data.get("state", None)
        code = post_data.get("code", None)
        username = post_data.get("username", None)
        fitbit_status = post_data.get("fitbit_status", None)
        if fitbit_status not in ['authorized', 'unauthorized']:
            _logger.error(f"Invalid fitbit status : {fitbit_status}")
            res.set_result(f"Please provide valid fitbit_status : ['authorized', 'unauthorized']")
            res.set_code(EAPIResponseCode.bad_request)
            return res.response
        if fitbit_status == 'authorized':
            # username = post_data.get("username", None)
            if not user_id or not state or not code or not username:
                _logger.error(f"Missing required parameters : [state, code, user_id, username]")
                res.set_result(f"Missing required parameters : [state, code, user_id, username]")
                res.set_code(EAPIResponseCode.internal_error)
                return res.response
            try:
                _logger.info(f"Trying to authorize user account on shimmer")
                shimmer_auth_url = ConfigClass.SHIMMER_BASE_URL + f"/authorize/{ConfigClass.FITBIT_SHIM_KEY}/callback"
                params = {
                    "code": code,
                    "state": state
                }
                shimmer_res = requests.get(shimmer_auth_url, params=params)
                shimmer_result = shimmer_res.json()
                if shimmer_res.status_code == 200 and shimmer_result['type'] == "AUTHORIZED":
                    # update user status in neo4j
                    _logger.info(f"Updting user status to authorized in neo4j for user id : {user_id}")
                    is_userinfo_updated, user_info = self.update_user_info_neo4j(user_id, fitbit_status)
                    if not is_userinfo_updated:
                        _logger.error(f"Error while updating user info {user_info}")
                        res.set_result(f"Error while updating user info {user_info}")
                        res.set_code(EAPIResponseCode.internal_error)
                        return res.response

                    is_created, msg = self.create_csv(username)
                    if not is_created:
                        _logger.error(f"Error while creating csv for user {msg}")
                        res.set_result(f"Error while creating csv for user {msg}")
                        res.set_code(EAPIResponseCode.internal_error)
                        return res.response
                    _logger.info(f"User status update and csv created successfully for user {username}")
                    res.set_result(user_info)
                    res.set_code(EAPIResponseCode.success)
                elif shimmer_result['type'] == "ERROR":
                    _logger.error(f"Error while getting details from shimmer : {json.loads(shimmer_res.text)}")
                    res.set_result(f"Error while getting details from shimmer : {json.loads(shimmer_res.text)}")
                    res.set_code(EAPIResponseCode.internal_error)
                return res.response
            except Exception as error:
                _logger.error(f"Failed update {user_id} details {error}")
                res.set_result(f"Failed update {user_id} details {error}")
                res.set_code(EAPIResponseCode.internal_error)
            return res.response
        elif fitbit_status == 'unauthorized':
            _logger.info(f"Updting user status to authorized in neo4j for user id : {user_id}")
            is_userinfo_updated, user_info = self.update_user_info_neo4j(user_id, fitbit_status)
            if not is_userinfo_updated:
                _logger.error(f"Error while updating user info {user_info}")
                res.set_result(f"Error while updating user info {user_info}")
                res.set_code(EAPIResponseCode.internal_error)
                return res.response
            _logger.info(f"User status updated to unauthorized successfully for user {username}")
            res.set_result(user_info)
            res.set_code(EAPIResponseCode.success)
            return res.response

    @staticmethod
    def update_user_info_neo4j(user_id: str, fitbit_status):
        try:
            neo4j_client = Neo4jClient()
            neo4j_client.update_node(label="user", id=int(user_id), params={"fitbit_status": fitbit_status})
            user_node = neo4j_client.get_node(None, int(user_id))
            user_info = node_2_json(user_node)
            return True, user_info
        except Exception as error:
            _logger.error(f"Error while updating user info in neo4j : {error}")
            return False, error

    @staticmethod
    def create_csv(username):
        try:
            file_path = ConfigClass.NFS_ROOT_PATH + f'/{username}.csv'
            _logger.info(f"File path : {file_path}")
            if not os.path.exists(file_path):
                with open(file_path, 'a') as f:
                    _logger.info(f"updating file permission")
                    os.chmod(file_path, 0o777)
                    _logger.info(f"successfully Created csv for user {username}")
                    return True, "success"
            else:
                return True, "success"
        except Exception as error:
            _logger.error(f"Error while trying to create a csv file : {error}")
            return False, error
