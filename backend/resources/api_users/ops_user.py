from platform import platform
from flask import request, after_this_request
from flask_restx import Api, Resource, fields, reqparse
from config import ConfigClass
from module_keycloak.ops_admin import OperationsAdmin
from module_keycloak.ops_user import OperationsUser
from models.api_response import APIResponse, EAPIResponseCode
from resources import userApi as api
from keycloak import exceptions
from services.reset_password_service.reset_password import SrvResetPassword
from resources.logger import Logger
import os
import json
import re
logging = Logger(name=f'{os.path.basename(__file__)[:-3]}.log')
class Login(Resource):
    # user login 
    ################################################################# Swagger
    query_payload = api.model(
        "user_login_form", {
            "username": fields.String(readOnly=True, description='username',required = True,),
            "password": fields.String(readOnly=True, description='password',required = True,),
            "realm": fields.String(readOnly=True, description='realm',required = True,),
        }
    )
    query_sample_return = '''
    # Below are the sample return
    {
        "result": {
            "access_token": "f9ZTJqEtSBo20k..."
            "expires_in": 3600,
            "refresh_expires_in": 1800,
            "refresh_token": "ys1mSBT_QjA...",
            "token_type": "bearer",
            "not-before-policy": 0,
            "session_state": "00496eca-7847-40dd-9792-a5d7152bf61d",
            "scope": "profile email"
        }
    }
    '''
    #################################################################
    @api.expect(query_payload)
    @api.response(200, query_sample_return)
    @api.response(400, "Invalid request input")
    @api.response(403, "Wrong credentials")
    @api.response(500, "Service error")
    def post(self):
        '''
        Login to the platform 
        '''  
        logging.info(f"Login".center(80, "="))
        try:
            res = APIResponse()
            post_data = request.get_json()
            username = post_data.get('username', None)
            password = post_data.get('password', None)  
            realm = post_data.get('realm', None) 
            user_role = post_data.get('user_role', None)
            role_list = ['container-requester','registered-user','instance-admin']
            logging.info(f"username: {username}")
            logging.info(f"realm: {realm}")
            if not username or not password or not user_role:
                logging.error('Missing required information')
                res.set_result('Missing required information')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code
            if not realm or not realm in ConfigClass.KEYCLOAK.keys():
                logging.error('Invalid realm')
                res.set_result('Invalid realm')
                res.set_code(EAPIResponseCode.bad_request)
                return res.response, res.code

            # log in 
            try:
                logging.info(f"login")
                obj_operations_user = OperationsUser(realm)
                logging.info(f"get_token")
                token = obj_operations_user.get_token(username, password)
                logging.info(f"token: {token}")
                logging.info(f"get_userinfo")
                user_info = obj_operations_user.get_userinfo(token)
                logging.info(f"user_info: {user_info}")
                if user_role == 'researcher' and user_info['user_role'] in role_list:
                    res.set_result(token)
                    res.set_code(EAPIResponseCode.success)
                elif user_role == user_info['user_role'] =='patient':
                    res.set_result(token)
                    res.set_code(EAPIResponseCode.success)
                else:
                    res.set_result('User type does not match')
                    res.set_code(EAPIResponseCode.conflict)                    
                return res.response, res.code
            except exceptions.KeycloakGetError as err:
                logging.error(f'keycloak error: {err}')
                err_code = err.response_code
                error_msg = json.loads(err.response_body)["error_description"]
                return {"result": error_msg}, err_code
            except Exception as e:
                logging.error(f'login error: {e}')
                res.set_result(f'User login failed : {e}')
                res.set_code(EAPIResponseCode.forbidden)
                return res.response, res.code

        except Exception as e:
            res.set_result(f'User login failed : {e}')
            res.set_code(EAPIResponseCode.internal_error)
            return res.response, res.code

class ChangePassword(Resource):
    # user change password: old password required
    ################################################################# Swagger
    payload = api.model(
        "user_password_payload", {
            "realm": fields.String(readOnly=True, description='realm'),
            "username": fields.String(readOnly=True, description='username'),
            "old_password": fields.String(readOnly=True, description='old password'),
            "new_password": fields.String(readOnly=True, description='new password'),
        }
    )
    sample_return = api.model(
        "user_password_res", {
            "result": fields.String(readOnly=True, description='result'),
        }
    )
    #################################################################
    @api.expect(payload)
    @api.response(200, sample_return)
    def put(self):
        '''
        Change password
        '''  
        # validate payload
        post_data = request.get_json()
        realm = post_data.get('realm', 'canarie')
        username = post_data.get('username', None)
        old_password = post_data.get('old_password', None)
        new_password = post_data.get('new_password', None)

        if realm is None or realm not in ConfigClass.KEYCLOAK.keys():
            return {'result': 'invalid realm'}, 400
        
        if username is None or old_password is None or new_password is None:
            return {'result': 'missing username, old password or new password'}, 400

        password_pattern = re.compile(ConfigClass.PASSWORD_REGEX)
        match = re.search(password_pattern, new_password)
        if not match:
            return {'result': 'invalid new password'}, 400

        # check old password
        client_id = ConfigClass.KEYCLOAK[realm][0]
        client_secret = ConfigClass.KEYCLOAK[realm][1]

        try:
            user_client = OperationsUser(realm)
            res = user_client.get_token(username, old_password)
        except Exception as e:
            return {'result': 'incorrect username or old password: {}'.format(e)}, 400

        # create admin client
        try:
            admin_username = ConfigClass.ADMIN_USERNAME
            admin_password = ConfigClass.ADMIN_PASSWORD
            admin_client = OperationsAdmin(realm)
        except Exception as e:
            return {'result': 'Internal error: {}'.format(e)}, 500

        # get user id
        try:
            user_id = admin_client.get_user_id(username)
        except Exception as e:
            return {'result': 'internal error: {}'.format(e)}, 500

        # set user password
        try:
            res = admin_client.set_user_password(user_id, new_password)
        except Exception as e:
            return {'result': 'internal error: {}. Please try again.'.format(e)}, 500

        return {'result': 'success'}, 200


class ForgetPassword(Resource):
    # user reset password: used when forget password
    ################################################################# Swagger
    payload = api.model(
        "user_password_payload", {
            "realm": fields.String(readOnly=True, description='realm'),
            "email": fields.String(readOnly=True, description='email')
        }
    )
    sample_return = api.model(
        "user_password_res", {
            "result": fields.String(readOnly=True, description='result'),
        }
    )
    #################################################################
    @api.expect(payload)
    @api.response(200, sample_return)
    def put(self):
        '''
        Send password reset link
        '''  
        # validate payload
        post_data = request.get_json()
        realm = post_data.get('realm', 'canarie')
        email = post_data.get('email', None)
        platform = post_data.get('platform', 'vhg')
        if realm is None or realm not in ConfigClass.KEYCLOAK.keys():
            return {'result': 'invalid realm'}, 400
        
        if email is None:
            return {'result': 'Please enter the email address you registered.'}, 400

        # create admin client
        try:
            admin_username = ConfigClass.ADMIN_USERNAME
            admin_password = ConfigClass.ADMIN_PASSWORD
            admin_client = OperationsAdmin(realm)
        except Exception as e:
            return {'result': 'Internal error: {}'.format(e)}, 500

        # get user id
        try:
            users = admin_client.list_user({'email': email})
            if len(users) < 1: 
                return {'result': 'Email has not been registered.'}            
            user_id = users[0]['id']
        except Exception as e:
            return {'result': 'internal error: {}'.format(e)}, 500

        srv_reset = SrvResetPassword()
        srv_reset.save_reset_link(users[0], platform)
        return {'result': 'reset link sent'}, 200


class CheckResetLink(Resource):
    # user reset password: used when forget password
    ################################################################# Swagger
    payload = api.model(
        "user_password_payload", {
            "realm": fields.String(readOnly=True, description='realm'),
            "reset_code": fields.String(readOnly=True, description='reset_code')
        }
    )
    sample_return = api.model(
        "check_reset_link", {
            "result": fields.String(readOnly=True, description='result'),
        }
    )
    #################################################################
    @api.expect(payload)
    @api.response(200, sample_return)
    def get(self):
        '''
        Check if password link expired
        '''  
        # validate payload
        # post_data = request.get_json()
        # realm = post_data.get('realm', 'canarie')
        # reset_code = post_data.get('reset_code', None)
        realm = request.args.get('realm', 'canarie')
        reset_code = request.args.get('reset_code', None)
        
        if reset_code is None:
            return {'result': 'Please send the password reset code.'}, 400

        srv_reset = SrvResetPassword()
        valid = srv_reset.check_code_valid(reset_code)
        if valid:
            user = srv_reset.retrieve_user_by_reset_code(reset_code)
            user_info = {
                "username": user[0][2],
                "email": user[0][3]
            }

            return {'result': 'active', "user_info": user_info}, 200
        else:
            return {'result': 'expired'}, 410

class SetPassword(Resource):
    # user change password using password reset link
    ################################################################# Swagger
    payload = api.model(
        "user_password_payload", {
            "realm": fields.String(readOnly=True, description='realm'),
            "reset_code": fields.String(readOnly=True, description='reset_code'),
            "new_password": fields.String(readOnly=True, description='new password'),
        }
    )
    sample_return = api.model(
        "user_password_res", {
            "result": fields.String(readOnly=True, description='result'),
        }
    )
    #################################################################
    @api.expect(payload)
    @api.response(200, sample_return)
    def post(self):
        '''
        Change password
        '''  
        # validate payload
        post_data = request.get_json()
        realm = post_data.get('realm', 'canarie')
        reset_code = post_data.get('reset_code', None)
        new_password = post_data.get('new_password', None)

        if realm is None or realm not in ConfigClass.KEYCLOAK.keys():
            return {'result': 'invalid realm'}, 400
        
        if reset_code is None:
            return {'result': 'missing code from password reset link'}, 400
        
        if new_password is None:
            return {'result': 'missing new password'}, 400

        password_pattern = re.compile(ConfigClass.PASSWORD_REGEX)
        match = re.search(password_pattern, new_password)
        if not match:
            return {'result': 'invalid new password'}, 400

        # create admin client
        try:
            admin_username = ConfigClass.ADMIN_USERNAME
            admin_password = ConfigClass.ADMIN_PASSWORD
            admin_client = OperationsAdmin(realm)
        except Exception as e:
            return {'result': 'Internal error: {}'.format(e)}, 500

        srv_reset = SrvResetPassword()
        # get user id                
        try:
            user_info = srv_reset.retrieve_user_by_reset_code(reset_code)
            if len(user_info) != 1: 
                raise Exception('internal error')                
            print(user_info)
            user_id = user_info[0][1]
            print(user_id)
        except Exception as e:
            return {'result': 'internal error: {}'.format(e)}, 500

        # set user password
        try:
            res = admin_client.set_user_password(user_id, new_password)
            srv_reset.notify_password_reset({'email': user_info[0][3]})
        except Exception as e:
            return {'result': 'internal error: {}. Please try again.'.format(e)}, 500

        return {'result': 'success'}, 200


class UserRefresh(Resource):
    # user refresh 
    ################################################################# Swagger
    query_payload = api.model(
        "user_refresh_payload", {
            "realm":fields.String(readOnly=True, description='realm',required = True, ),
            "refreshtoken": fields.String(readOnly=True, description='refreshtoken',required = True, )
        }
    )
    query_sample_return = '''
    # Below are the sample return
    {
        "result": {
            "access_token": "f9ZTJqEtSBo20k..."
        }
    }
    '''
    #################################################################
    @api.expect(query_payload)
    @api.response(200, query_sample_return)
    @api.response(400, "missing refresh token")
    @api.response(403, "Failed to refresh with Exception msg {result: <error_msg>}")
    def post(self):
        '''
        Extend user session by 3 mins
        '''
        try:
            post_data = request.get_json()
            token = post_data.get('refreshtoken', None)
            print(token)
            realm = post_data.get('realm', None) 
            if not token:
                return {'result': 'missing refresh token'}, 400
                
            obj_Operations_user = OperationsUser(realm)
            token = obj_Operations_user.get_refresh_token(token)

        except Exception as e:
            return {'result': str(e)}, 403

        return {'result': token}, 200



