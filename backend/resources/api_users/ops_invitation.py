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
from resources.utils import neo4j_obj_2_json, node_2_json, create_redcap_record
#from module_neo4j.ops_neo4j_base import Neo4jNode, Neo4jRelationship
from models.custom_exception import ValidationError
import json
import math
import requests
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship
from services.notifier_services.email_service import SrvEmail
from resources.logger import Logger
import os

logging = Logger(name=f'{os.path.basename(__file__)[:-3]}.log')

class InvitationsRestful(Resource):
    # Invite user
    ################################################################# Swagger
    create_invitation_request_model = api.model("create_invitation_form", {
        "email": fields.String(description='user email',required = True, ),
        "projectId": fields.Integer(description='project ID, put -1 for inviting to platform',required = True, ),
        "role": fields.String(description='role, one of the following ["container-requester","instance-admin","registered-user"]',required = True, ),
        "firstname": fields.String(description='user first name',required = True, ),
        "lastname": fields.String(description='user last name',required = True, ),
        "username":fields.String(description='username',required = True, )
    })
    create_invitation_return_example = '''
        {
            "code": 200,
            "error_msg": "",
            "page": 1,
            "total": 1,
            "num_of_pages": 1,
            "result": "[SUCCEED] Invitation Saved, Email Sent"
        }
    '''
    #################################################################
    @api.expect(create_invitation_request_model)
    @api.response(200, create_invitation_return_example)
    def post(self):
        '''
        This method allow to create invitation in platform.
        '''
        logging.info("InvitationsRestful".center(80, "="))
        my_res = APIResponse()
        access_token = request.headers.get("Authorization", None)
        ## init form
        post_json = request.get_json()
        logging.info(f"Received payload: {post_json}")
        neo4j_client = Neo4jClient()
        email = post_json.get('email')
        user_node = neo4j_client.query_node("user", {"email": email})
        logging.info(f"Cheching user node: {user_node}")
        if not post_json.get('projectId'):
            my_res.set_result("Missing projectId")
            my_res.set_code(EAPIResponseCode.bad_request)
            return my_res.response, my_res.code
        logging.info("[INFO] Start Creating Invitation: {}".format(post_json))
        if (post_json.get('role', None) == 'patient'):
                if not post_json.get('question', None) or not post_json.get('answer' , None) or not post_json.get('projectId', None ):
                    my_res.set_result("Missing required information")
                    my_res.set_code(EAPIResponseCode.bad_request)
                    return my_res.response, my_res.code
        invitation_form  = InvitationForm(post_json)
        ## init invitation managemer
        invitation_mgr = SrvInvitationManager()
        ## save invitation
        invitation_mgr.save_invitation(invitation_form, access_token)
        my_res.set_result('[SUCCEED] Invitation Saved, Email Sent')
        my_res.set_code(EAPIResponseCode.success)
        return my_res.response, my_res.code



class InvitationRestful(Resource):
    # Invite user
    ################################################################# Swagger

    read_invitation_return_example = '''
        {
            "code": 200,
            "error_msg": "",
            "page": 1,
            "total": 1,
            "num_of_pages": 1,
            "result": {
                "role": "testrole",
                "projectId": 1,
                "email": "zhengyangma9517@gmail.com"
            }
        }
        '''
    #################################################################
    @api.response(200, read_invitation_return_example)
    def get(self, invitation_hash):
        '''
        This method allow to get invitation details by HashID.
        '''
        ## init resp
        # print(my_res.response)
        my_res = APIResponse()
        ## init invitation managemer
        invitation_mgr = SrvInvitationManager()
        invitation_validation = invitation_mgr.validate_invitation_code(invitation_hash)
        is_valid = invitation_validation[0]
        invitation_find = invitation_validation[1]
        if is_valid:
            form_data = json.loads(invitation_find[1])
            invitation_form = InvitationForm(form_data)
            operations_admin = OperationsAdmin('canarie')
            users = operations_admin.list_user({'email':invitation_form.email})
            if users:
                user = users[0]
                user_info = {
                'is_Registered': True,
                'username': user['username'],
                'enabled': user['enabled'],
                'firstname': user['firstName'],
                'lastname': user['lastName'],
                'email': user['email'],
                'role': user['attributes'].get('user_role')
                }
                invitation_form.form_dict.update(user_info)
            else:
                user_info = {
                 'is_Registered': False
                }
                invitation_form.form_dict.update(user_info)
            print(user_info)
            my_res.set_code(EAPIResponseCode.success)
            my_res.set_result(invitation_form.form_dict)
            my_res.set_error_msg('')

        else:
            my_res.set_code(EAPIResponseCode.not_found),
            my_res.set_error_msg('Invitation Not Found Or Expired')
        return my_res.response, my_res.code
class AnswerQuestion(Resource):
    def post(self, invitation_hash):
        '''
        This method is used to check if the answer to question from invitation is correct for a patient and adds patient to the container, study.
        '''
        my_res = APIResponse()
        ## init invitation managemer
        invitation_mgr = SrvInvitationManager()
        invitation_validation = invitation_mgr.validate_invitation_code(invitation_hash)
        is_valid = invitation_validation[0]
        invitation_find = invitation_validation[1]
        form_data = request.get_json()
        email = invitation_find[4]
        dataset_id = invitation_find[5]
        relation = invitation_find[6]
        answer = form_data.get('answer', None)
        if is_valid:
                if (invitation_mgr.answer_question(invitation_hash, answer)):
                    ## Add patient to study
                    logging.info(f"Users' answer match")
                    neo4j_client = Neo4jClient()
                    neo4j_method = Neo4jRelationship()
                    try:
                        node = neo4j_client.get_node("study", int(dataset_id))
                        result = [node_2_json(node)]
                        study_name = result[0]['name']
                        redcap_token = result[0].get('redap_token')
                        logging.info(f"Study found: {len(result)}")
                        if len(result) == 0:
                            my_res.set_result("Study not exists")
                            my_res.set_code(EAPIResponseCode.not_allowed)
                            return my_res.response, my_res.code
                        user_node = neo4j_client.query_node("user", {"email": email})
                        user_node_result = [node_2_json(x) for x in user_node]
                        logging.info(f"user_node_result: {len(user_node_result)}")
                        logging.info(f"user_node_result: {user_node_result}")
                        if len(user_node_result) == 0:
                            my_res.set_result("User with given email address not found")
                            my_res.set_code(EAPIResponseCode.not_found)
                            return my_res.response, my_res.code
                        user_node_id = user_node_result[0]["id"]
                        user_role = user_node_result[0]["role"]
                        if user_role == "instance-admin":
                            my_res.set_result("Instance admin default has admin privileges for all project")
                            my_res.set_code(EAPIResponseCode.bad_request)
                            return my_res.response, my_res.code
                        neo4j_client.add_relation_between_nodes(relation, int(user_node_id), int(dataset_id))
                        guid = requests.get(f'{ConfigClass.GUID_URL}/2keys/canarie_guid?userid={user_node_id}&projid={dataset_id}') # -1 for platform            
                        param_guid = {'container_guid_container': user_node_result[0]['container_guid_container'],
                                      'container_guid_guid': user_node_result[0]['container_guid_guid']}
                        param_guid['container_guid_container'].append(dataset_id)
                        param_guid['container_guid_guid'].append(guid.json()['guid'])
                        neo4j_client.update_node(None, user_node_id, param_guid)
                        logging.info(f"param_guid: {param_guid}")
                        # send email that you have been added to study
                        email_sender = SrvEmail()
                        link = ConfigClass.PATIENT_PORTAL_URL + "/study/" + str(18)+ '/landing'
                        subject = 'Canarie PDG - Added to Study'
                        info = {
                            'user_name': user_node_result[0]['firstname'],   
                            'study_name': study_name,
                            'study_homepage': link
                        }
                        email_sender.send_html("added_to_study_notification_patient.html", info, subject, [email])  
                        logging.info(f"email info sent: {info}")
                        # send email to container admin of new patient added
                        # get admins on study
                        admin_user = neo4j_method.get_relation_with_params(start_label="user", end_label="study", end_params= { "id" : int(result[0]['id'])})
                        relations = []
                        for x in admin_user:
                            json_node = neo4j_obj_2_json(x)
                            ## only show with realtion property patient_portal with True in patient portal
                            if(json_node['r']['type'] != 'patient' and json_node['r'].get("patient_portal", None) == True):
                                temp = json_node['start_node']
                                temp["permission"] = json_node['r']['type']
                                relations.append(temp)
                        admin_of_study = []
                        tempperms = set()
                        for z in relations:
                            tempperms.add(z['permission'])
                            if(z['permission'] == 'admin' or z['permission'] == 'member'):
                                admin_of_study.append(z)
                        for user in admin_of_study:
                            name_of_admin_study = user['firstname']
                            email_of_admin_study = user['email']
                            time_stamp = user['time_lastmodified']
                            email_sender.send(study_name + ' - Enrolment Event', "Hi " + name_of_admin_study + "," +
                                        "\nA new patient enrollment event has occurred as of " + time_stamp +". Please click here " + link + " if you would like to view all currently enrolled patients."
                                        + "\r\n\n If you cannot access the links in this email please copy and paste the following into your internet browser" + "\r\n\n This notification is automatically generated by the Patient Data Gateway please contact help@pdg.ca if you require assistance.", email_of_admin_study
                                        )
                        if redcap_token:
                            try:
                                location = param_guid['container_guid_container'].index(dataset_id)
                                current_container_guid = param_guid['container_guid_guid'][location]
                                logging.info(f"Current corresponding container_guid_guid: {current_container_guid}")
                                redcap_result = create_redcap_record(redcap_token, current_container_guid)
                                logging.info(f"Adding redcap result: {redcap_result}")
                            except Exception as e:
                                logging.info(f"Exception: {e}")
                                my_res.set_result(f"Failed to create record in redcap {e}")
                                my_res.set_code(EAPIResponseCode.internal_error)
                        my_res.set_result({'success': True})
                        my_res.set_code(EAPIResponseCode.success)
                    except ValidationError as e:
                            logging.info(f"ValidationError: {e}")
                            my_res.set_result(f"Failed to link users with given container. {e}")
                            my_res.set_code(EAPIResponseCode.forbidden)
                    except Exception as e:
                        logging.info(f"Exception: {e}")
                        my_res.set_result(f"Unable to link user {email} to given container because of {e}")
                        my_res.set_code(EAPIResponseCode.internal_error)
                        return my_res.response, my_res.code
                else:
                    my_res.set_code(EAPIResponseCode.success)
                    my_res.set_result({'success': False})
        else:
            logging.info(f"Invalid invitation")
            my_res.set_code(EAPIResponseCode.not_found),
            my_res.set_error_msg('Invitation Not Found Or Expired')
        return my_res.response, my_res.code

class PendingUserRestful(Resource):
    '''
    This method allow to get all pending users.
    '''
    @jwt_required()
    def get(self):
        my_res = APIResponse()
        ## init invitation managemer
        invitation_mgr = SrvInvitationManager()

        try:
            page = request.args.get('page', 0)
            page_size = request.args.get('page_size', 10)
            order_by = request.args.get('order_by', 'create_timestamp')
            order_type = request.args.get('order_type', 'desc')
            filters = request.args.get('filters', None)

            page = int(page)
            page_size = int(page_size)

            if filters:
                filters = json.loads(filters)

            records, count = invitation_mgr.get_invitations(page, page_size, filters, order_by, order_type)

            result = []

            for record in records:
                detail = json.loads(record.invitation_detail)
                user_info = { 
                    'expiry_timestamp': record.expiry_timestamp.timestamp(),
                    'create_timestamp': record.create_timestamp.timestamp(),
                    'invitation_code': record.invitation_code,
                    'is_active': record.is_active,
                    'status': record.status,
                    **detail
                }
                result.append(user_info)
            my_res.set_result(result)
            my_res.set_total(count)
            my_res.set_num_of_pages(math.ceil(count/page_size))
            my_res.set_page(page)
            
            return my_res.response, my_res.code
            
        except Exception as e:
            print(e)
            my_res.set_code(EAPIResponseCode.internal_error)
            my_res.set_error_msg('Internal Error' + str(e))
            return my_res.response, my_res.code


class UpdateInvitation(Resource):
    '''
    This method allow to update invitations.
    '''
    @jwt_required()
    def put(self):
        my_res = APIResponse()
        invitation_mgr = SrvInvitationManager()

        post_json = request.get_json()

        if not post_json.get('invitation_code'):
            my_res.set_result("Missing invitation_code")
            my_res.set_code(EAPIResponseCode.bad_request)
            return my_res.response, my_res.code
        if not post_json.get('action'):
            my_res.set_result("Missing action")
            my_res.set_code(EAPIResponseCode.bad_request)
            return my_res.response, my_res.code

        invitation_code = post_json.get('invitation_code')
        action = post_json.get('action')

        if action == 'resend':
            result = invitation_mgr.resend_invitation(invitation_code)
        elif action == 'cancel':
            result = invitation_mgr.cancel_invitation(invitation_code)

        return my_res.response, my_res.code


        
