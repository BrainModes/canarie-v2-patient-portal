from flask_restx import Api, Resource, fields
# from flask_restful import Api
module_api = Api(
    version='1.0',
    title='Canarie API',
    description='Canarie API',
    doc='/v1/api-doc'
)



api = module_api.namespace('Containers', description='Operation on containers', path ='/')

# project operations
from resources.api_projects.ops_project import DatasetsAdmin, Datasets, DatasetUserOperation, \
            DatasetProperty, DatasetProperties, DatasetTest, DiscoverableDataSets
api.add_resource(DatasetProperties, '/v1/dataset/<dataset_id>/properties', '/v1/dataset/<dataset_id>/properties/<key>')
api.add_resource(DiscoverableDataSets, '/v1/dataset/discoverable')

from resources.api_projects.ops_patients import Patients
from resources.api_projects.ops_researchers import Researchers, ResearchersAppicable
api.add_resource(DatasetsAdmin,'/v1/node/<id>/<relation>')
api.add_resource(Datasets, '/v1/containers')
api.add_resource(DatasetUserOperation, '/v1/<dataset_id>/users')
api.add_resource(DatasetProperty, '/v1/<dataset_id>/datasetproperty')
api.add_resource(DatasetTest, '/test/rel')
api.add_resource(Patients, "/v1/<dataset_id>/patients")
api.add_resource(Researchers, "/v1/<dataset_id>/researchers")
api.add_resource(ResearchersAppicable, "/v1/<dataset_id>/applicable")


userApi = module_api.namespace('Users', description='Operation on users, including registration, authentication, user actions', path ='/')
# user operations
from resources.api_users.ops_user import Login,UserRefresh,ChangePassword,ForgetPassword,CheckResetLink,SetPassword
userApi.add_resource(Login, '/v1/users/login')
userApi.add_resource(UserRefresh, '/v1/users/refresh')
userApi.add_resource(ChangePassword, '/v1/users/password/change')
userApi.add_resource(ForgetPassword, '/v1/users/password/forget')
userApi.add_resource(CheckResetLink, '/v1/users/resetlink/status')
userApi.add_resource(SetPassword, '/v1/users/password/set')

# list users
from resources.api_projects.ops_patients import ListUsers, CheckUserRedCapSurvey, GetUserRedCapSurveyLink, GetUserRedCapSurveyQueueLink, GetSurveyCompleteStatus
userApi.add_resource(ListUsers, '/v1/<dataset_id>/listusers')
userApi.add_resource(CheckUserRedCapSurvey, '/v1/user-survey/check')
userApi.add_resource(GetUserRedCapSurveyQueueLink, '/v1/user-survey-queue/link')
userApi.add_resource(GetUserRedCapSurveyLink, '/v1/user-survey/link')
userApi.add_resource(GetSurveyCompleteStatus, '/v1/user-survey/status')


# admin-only operations
from resources.api_users.ops_admin import AddUser, ListUser, GetUserByUsername, UserActions, AssignUserRole, NeoUsers, AddForeignID, UpdateUserInfo
userApi.add_resource(AddUser, '/v1/admin/users')
userApi.add_resource(ListUser, '/v1/admin/userlist/<realm>')
userApi.add_resource(NeoUsers, '/v1/admin/userlist/neo4j')
userApi.add_resource(GetUserByUsername, '/v1/admin/userinfo')
userApi.add_resource(UserActions, '/v1/admin/users')
userApi.add_resource(AssignUserRole, '/v1/<dataset_id>/assign/<user_id>')
userApi.add_resource(AddForeignID, '/v1/addforeignid/<dataset_id>')
userApi.add_resource(UpdateUserInfo, '/v1/user-status/<user_id>')

# invitation
from resources.api_users.ops_invitation import InvitationsRestful,InvitationRestful,AnswerQuestion, PendingUserRestful, UpdateInvitation
userApi.add_resource(InvitationsRestful, '/v1/admin/invite')
userApi.add_resource(InvitationRestful, '/v1/admin/invite/<invitation_hash>')
userApi.add_resource(AnswerQuestion, '/v1/admin/answer/<invitation_hash>')
userApi.add_resource(PendingUserRestful, '/v1/admin/invitation-list')
userApi.add_resource(UpdateInvitation, '/v1/admin/invitation')

# GUID
from resources.api_guid.guid_user import GUIDUser
userApi.add_resource(GUIDUser, '/v1/guid/user')

# static
from resources.api_files.file_project import FileProject
userApi.add_resource(FileProject, '/v1/dataset/file/<dataset_id>')
userApi.add_resource(FileProject, '/v1/dataset/file/<dataset_id>/<key>')

# scripts
from resources.api_scripts.invitation_scripts import UpdateInvitationScript

scripts_api = module_api.namespace('Scripts', description='Scripts on containers', path ='/')
scripts_api.add_resource(UpdateInvitationScript, '/v1/scripts/update-invitations')

# wearable client libraries
from resources.wearables_client_libraries.fitbit_api import Auth, ProcessAuth
from resources.wearables_client_libraries.fitbit_data_points import FitbitDataPoints
from resources.wearables_client_libraries.vendor_info import VendorInfo

# ClientAPIs = module_api.namespace('ClientAPIs', description='wearable client libraries')
api.add_resource(Auth, '/v1/fitbit/auth/<username>')
api.add_resource(ProcessAuth, '/v1/fitbit/process-auth/<username>')
api.add_resource(FitbitDataPoints, '/v1/fitbit/data-points/<label>')
api.add_resource(VendorInfo, '/v1/vendor-info')

