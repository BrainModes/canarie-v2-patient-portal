from models.service_meta_class import MetaService
from models.invitation import InvitationForm, InvitationModel, db
from services.notifier_services.email_service import SrvEmail
from services.data_providers.bff_rds import SrvRDSSingleton
# from services.container_services.container_manager import SrvContainerManager
from resources.utils import helper_now_utc
from config import ConfigClass
from hashlib import md5
import json
from datetime import timedelta
from module_neo4j.py2neo import Neo4jClient, Neo4jRelationship
from resources.utils import node_2_json

class SrvInvitationManager(metaclass=MetaService):

    def __init__(self):
        self.rds_singleton = SrvRDSSingleton()
        self.rds_schema = ConfigClass.RDS_SCHEMA_DEFAULT
        self.table_full_name = "user_invitation"

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
        is_active = invitation_detail[len(invitation_detail) - 1]
        print('initation_detail: ', invitation_detail)
        print('expiry_dt: ', expiry_dt)
        print('now_dt: ', now_dt)
        print('diff_dt_days: ', diff_dt_days)
        print('is_active: ', is_active)
        is_valid = True if invitation_detail and diff_dt_days > 0 and is_active else False
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

    def save_invitation(self, invitation: InvitationForm, access_token):
        email_sender = SrvEmail()
        # container_mgr = SrvContainerManager()
        raw_data_str = invitation.email + str(invitation.project_id)
        invitation_code_generated = md5(raw_data_str.encode('utf-8')).hexdigest()
        invitataion_link = ConfigClass.INVITATION_URL_PREFIX + '/' + invitation_code_generated
        form_data = invitation.form_dict
        form_data_json = json.dumps(form_data)
        now_utc_dt = helper_now_utc()
        expiry_dt = now_utc_dt + timedelta(days=ConfigClass.INVITATION_EXPIRY_DAYS)
        create_timestamp = "Timestamp'{}'".format(now_utc_dt.isoformat())
        expiry_timestamp = "Timestamp'{}'".format(expiry_dt.isoformat())
        if (invitation.role == 'patient'):

            update_query = "UPDATE {} SET expiry_timestamp = {} \
            WHERE email='{}' AND project='{}' AND role='{}' RETURNING *".format(
            self.table_full_name,
            "Timestamp'{}'".format(now_utc_dt.isoformat()),
            invitation.email,
            str(invitation.project_id),
            invitation.role
            )
            save_query = "INSERT INTO {}(invitation_code, invitation_detail, expiry_timestamp, create_timestamp, email, project, role, question, answer) \
                values ('{}', '{}', {}, {}, '{}', '{}', '{}', '{}', '{}') RETURNING *".format(
            self.table_full_name,
            invitation_code_generated,
            form_data_json,
            expiry_timestamp,
            create_timestamp,
            invitation.email,
            str(invitation.project_id),
            str(invitation.role),
            form_data.get('question'),
            form_data.get('answer')
            )
        else:
            update_query = "UPDATE {} SET expiry_timestamp = {} \
            WHERE email='{}' AND project='{}' RETURNING *".format(
            self.table_full_name,
            "Timestamp'{}'".format(now_utc_dt.isoformat()),
            invitation.email,
            str(invitation.project_id),
            )

            save_query = "INSERT INTO {}(invitation_code, invitation_detail, expiry_timestamp, create_timestamp) \
            values ('{}', '{}', {}, {}) RETURNING *".format(
            self.table_full_name,
            invitation_code_generated,
            form_data_json,
            expiry_timestamp,
            create_timestamp
            )
        updated = self.rds_singleton.simple_query(update_query)
        print('[Info]', len(updated), 'Update Invitation')
        print(form_data)
        inserted = self.rds_singleton.simple_query(save_query)
        print('[Info]', len(inserted), 'Invitation Saved To Database')
        # my_project = container_mgr.check_container_exist(
        #         access_token, "Dataset", invitation.project_id)[0]
        # my_project_name = my_project['name']
        if (invitation.role == 'patient'):
            neo4jClient = Neo4jClient()
            study = neo4jClient.get_node("study", int(invitation.project_id))
            study_json = node_2_json(study)
            link = ConfigClass.INVITATION_URL_PREFIX_PATIENT + '/' + invitation_code_generated
            study_homepage = ConfigClass.PATIENT_PORTAL_URL + '/' + "study" + "/" + invitation.project_id + "/" + "landing"
            subject = 'Welcome to Canarie Patient Portal'
            info = {  
                'study': study_json['name'],
                'link': link,
                'study_homepage': study_homepage
            }
            email_sender.send_html("invite_patient.html", info, subject, [invitation.email])  
        else:
            email_sender.send("Welcome to Canarie Researcher Portal", "You have been added to the Researcher Portal, please register to access it: " + invitataion_link
            + "\r\n Project ID: " + str(invitation.project_id)
            + "\r\n Project Role: " + str(invitation.role),
            invitation.email)
        return 'Saved'

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


    def get_invitations(self, page, page_size, filters, order_by, order_type):
        if not filters:
            filters = {}

        sql_filter = {}
        if "project_id" in filters:
            sql_filter["project"] = str(filters["project_id"])

        sql_filter["role"] = "patient"

        invites = db.session.query(InvitationModel).filter_by(**sql_filter)
        if "email" in filters:
            invites = invites.filter(InvitationModel.email.like("%" + filters["email"] + "%"))
        if "status" in filters:
            if filters["status"] == "disabled":
                invites = invites.filter(InvitationModel.expiry_timestamp <= datetime.now())
            else:
                invites = invites.filter(InvitationModel.expiry_timestamp >= datetime.now())

        if not order_by:
            order_by = "expiry_timestamp"
        if order_type == "desc":
            sort_param = getattr(InvitationModel, order_by).desc()
        else:
            sort_param = getattr(InvitationModel, order_by).asc()
        invites = invites.order_by(sort_param)
        count = len(invites.all())
        invites = invites.offset(page * page_size).limit(page_size).all()
        return invites, count

    def resend_invitation(self, invitation_code):
        email_sender = SrvEmail()
        now_utc_dt = helper_now_utc()
        expiry_dt = now_utc_dt + timedelta(days=ConfigClass.INVITATION_EXPIRY_DAYS)

        update_query = "UPDATE {} SET is_active={}, create_timestamp={}, expiry_timestamp = {} \
            WHERE invitation_code='{}' RETURNING project, email".format(
            self.table_full_name,
            True,
            "Timestamp'{}'".format(now_utc_dt.isoformat()),
            "Timestamp'{}'".format(expiry_dt.isoformat()),
            invitation_code
        )

        updated = self.rds_singleton.simple_query(update_query)
        
        updated_data = updated[0]
        projectId = updated_data[0]
        email = updated_data[1]

        neo4jClient = Neo4jClient()
        study = neo4jClient.get_node("study", int(projectId))
        study_json = node_2_json(study)
        link = ConfigClass.INVITATION_URL_PREFIX_PATIENT + '/' + invitation_code
        study_homepage = ConfigClass.PATIENT_PORTAL_URL + '/' + "study" + "/" + projectId + "/" + "landing"
        subject = 'Welcome to Canarie Patient Portal'
        info = {  
            'study': study_json['name'],
            'link': link,
            'study_homepage': study_homepage
        }
        email_sender.send_html("invite_patient.html", info, subject, [email])

        return 'Resended'


    def cancel_invitation(self, invitation_code):
        email_sender = SrvEmail()
        now_utc_dt = helper_now_utc()

        update_query = "UPDATE {} SET is_active={}, expiry_timestamp = {} \
            WHERE invitation_code='{}' RETURNING project, email".format(
            self.table_full_name,
            False,
            "Timestamp'{}'".format(now_utc_dt.isoformat()),
            invitation_code
        )

        updated = self.rds_singleton.simple_query(update_query)

        return 'Canceled'


    def update_invitation_script(self):
        query = "SELECT * FROM {} WHERE email IS NOT NULL".format(self.table_full_name)

        invitations = self.rds_singleton.simple_query(query)

        for invitation in invitations:
            email = invitation[-8]
            neo4jClient = Neo4jClient()

            node = neo4jClient.query_node('user', {"email": email})

            if len(node) > 0:
                update_query = "UPDATE {} SET status = '{}' \
                    WHERE email='{}' RETURNING project, email".format(
                    self.table_full_name,
                    "registered",
                    email
                )

                updated = self.rds_singleton.simple_query(update_query)
                print(updated)

        return True

    def register(self, email):
        now_utc_dt = helper_now_utc()
        '''
        update_query = "UPDATE {} SET status = '{}', is_active={}, expiry_timestamp = {} \
            WHERE email='{}' RETURNING project, email".format(
            self.table_full_name,
            "registered",
            False,
            "Timestamp'{}'".format(now_utc_dt.isoformat()),
            email
        )
        '''
        update_query = "UPDATE {} SET status = '{}', is_active={} \
            WHERE email='{}' RETURNING project, email".format(
            self.table_full_name,
            "registered",
            False,
            email
        )

        updated = self.rds_singleton.simple_query(update_query)

        return 'Registered'
