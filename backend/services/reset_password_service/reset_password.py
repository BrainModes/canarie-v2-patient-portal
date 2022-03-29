from models.service_meta_class import MetaService
from models.invitation import InvitationForm
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
# from services.container_services.container_manager import SrvContainerManager
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta
import secrets

from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship
from resources.utils import node_2_json


class SrvResetPassword(metaclass=MetaService):

    def __init__(self):
        self.rds_singleton = SrvRDSSingleton()
        self.rds_schema = ConfigClass.RDS_SCHEMA_DEFAULT
        self.table_full_name = "password_reset"

    def validate_invitation_code(self, invitation_code):
        '''
        (str) -> (bool, InvitationForm | None)    #**TypeContract**
        '''
        print('[Info]', ' start validating invitation code...........')
        invitation_detail = self.read_invitation(invitation_code)
        if not invitation_detail:
            return (False, None)
        expiry_dt = invitation_detail[2]
        now_dt = helper_now_utc().replace(tzinfo=None)
        diff_dt_days = (expiry_dt - now_dt).days
        is_valid = True if invitation_detail and diff_dt_days > 0 else False
        print('[Info] valid invitation' if is_valid else '[Error] invalid invitation')
        return (is_valid, invitation_detail)

    def read_invitation(self, invitation_code):
        '''
        (str) -> () | None   #**TypeContract**
        '''
        read_query = "Select * from {} where invitation_code='{}' ORDER BY create_timestamp asc".format(
            self.table_full_name,
            invitation_code)
        invitation_feteched = self.rds_singleton.simple_query(read_query)
        return invitation_feteched[len(invitation_feteched) - 1] if invitation_feteched != [] else None

    def save_reset_link(self, userinfo, platform):
        email_sender = SrvEmail()
        reset_code_generated = secrets.token_urlsafe(32)
        url = {
            'vhg': ConfigClass.VHG_RESET_PASSWORD_URL_PREFIX,
            'rp': ConfigClass.RP_RESET_PASSWORD_URL_PREFIX
        }.get(platform)
        pwd_reset_link = url + '/' + reset_code_generated
        now_utc_dt = helper_now_utc()
        expiry_dt = now_utc_dt + timedelta(days=ConfigClass.INVITATION_EXPIRY_DAYS)
        create_timestamp = "{}".format(now_utc_dt.isoformat())
        expiry_timestamp = "{}".format(expiry_dt.isoformat())

        save_query = "INSERT INTO {}(reset_code, user_id, user_name, email, create_timestamp, expiry_timestamp) \
            values ('{}', '{}', '{}', '{}', '{}', '{}') RETURNING *".format(
        self.table_full_name,
        reset_code_generated,
        userinfo['id'],
        userinfo['username'],
        userinfo['email'],        
        create_timestamp,
        expiry_timestamp
            )

        inserted = self.rds_singleton.simple_query(save_query)

        subject = 'Instructions to reset your password'
        info = {  
            'user_name': userinfo['firstName'],
            'reset_link': pwd_reset_link
        }
        email_sender.send_html("instructions_to_reset_password.html", info, subject, [userinfo['email']])  

        return 'Saved'

    def check_code_valid(self, reset_code):
        query = "select expiry_timestamp from {} where reset_code='{}' ".format(
            self.table_full_name,
            reset_code
            )
        expiry_time = self.rds_singleton.simple_query(query)
        if len(expiry_time) == 0 or not expiry_time[0][0]:
            return False
        expiry_dt = expiry_time[0][0]
        now_dt = helper_now_utc().replace(tzinfo=None)   
        diff_dt_days = (expiry_dt - now_dt).days
        return len(expiry_time) == 1 and diff_dt_days > 0

    def retrieve_user_by_reset_code(self, reset_code):
        query = "select * from {} where reset_code='{}' ".format(
            self.table_full_name,
            reset_code
        )
        return self.rds_singleton.simple_query(query)

    def notify_password_reset(self, userinfo):        
        email_sender = SrvEmail()
        subject = 'Canarie password change confirmation'
        info = {  
        }
        email_sender.send_html("password_change_confirmation.html", info, subject, [userinfo['email']])            

    def deactivate_invitation(self):
        pass

    def answer_question(self, invitation_code, answer):
        print('[Info]', 'Checking Answer to invitation')
        print(invitation_code)
        read_query = "SELECT answer FROM {} WHERE invitation_code ='{}'".format(self.table_full_name, invitation_code)
        read = self.rds_singleton.simple_query(read_query)
        db_answer = read[0][0]
        if (db_answer == answer):
            return True
        else:
            return False