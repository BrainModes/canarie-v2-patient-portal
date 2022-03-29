# flask configs
# curl -d "client_secret=fe0bb81e-958e-4b11-83c0-a7a8e128057c" -d "client_id=canarie2.0" -d "username=tgao714" -d "password=123" -d "grant_type=password" "http://10.3.9.241:8080/auth/realms/canarie/protocol/openid-connect/token"
import os


class ConfigClass(object):

    # keycloak info
    KEYCLOAK_SERVER_URL = "http://10.3.9.241:8080/auth/"
    KEYCLOAK_TOKEN_URL = "http://10.3.9.241:8080/auth/realms/{}/protocol/openid-connect/token"
    KEYCLOAK_USER_URL = "http://10.3.9.241:8080/auth/admin/realms/{}/users"
    KEYCLOAK_GRANT_TYPE = "password"
    ADMIN_USERNAME = "canarie-admin"
    ADMIN_PASSWORD = "indoc101"
    PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\-_!%&/()=?*+#,.;])[A-Za-z\d\-_!%&/()=?*+#,.;]{11,30}$"
    # realm, client id, client secret
    KEYCLOAK = {
        "canarie":   ["canarie2.0", "fe0bb81e-958e-4b11-83c0-a7a8e128057c"]
    }

    # shimmer
    SHIMMER_BASE_URL = "http://10.3.9.242:8084"
    FITBIT_SHIM_KEY = "fitbit"
    FITBT_DATA_POINTS = ["step_count", "sleep_duration", "physical_activity"]

    # folder for small file uploads
    UPLOAD_FOLDER = 'files/'


    # the packaged modules
    api_modules = ["resources"]

    ######################################################################################################
    # Email Notify Service
    EMAIL_SERVICE = "http://10.3.9.240:5065/v1/email"
    EMAIL_DEFAULT_NOTIFIER = "notification@canarie.com"

    # User Invitation
    INVITATION_URL_PREFIX = 'https://rp.indocresearch.org/self-registration' #"http://10.3.1.120:3001/self-registration"   #http://10.3.1.120:5000/v1/api-doc
    INVITATION_EXPIRY_DAYS = 30
    # PATIENT_PORTAL_URL = "http://10.3.1.120:3000"
    PATIENT_PORTAL_URL = "https://vhg.indocresearch.org"

    # INVITATION_URL_PREFIX_PATIENT = "http://10.3.1.120:3000/invite"
    INVITATION_URL_PREFIX_PATIENT = "https://vhg.indocresearch.org/invite"
    # RESET_PASSWORD_URL_PREFIX = "http://10.3.1.120:3000/pwdreset"
    VHG_RESET_PASSWORD_URL_PREFIX = "https://vhg.indocresearch.org/pwdreset"
    RP_RESET_PASSWORD_URL_PREFIX = "https://rp.indocresearch.org/pwdreset"
    
    # BFF RDS
    RDS_HOST = "10.3.9.205"
    RDS_PORT = "5432"
    RDS_DBNAME = "canarie"
    RDS_USER = "canarieadmin"
    RDS_PWD = "indocAdmin2020"
    RDS_SCHEMA_DEFAULT = "canarie"
    SQLALCHEMY_DATABASE_URI = f"postgres://{RDS_USER}:{RDS_PWD}@{RDS_HOST}/{RDS_DBNAME}"

    #graph database
    NEO4J_URL = "bolt://10.3.9.205:7687"
    NEO4J_USER = 'neo4j'
    NEO4J_PASS = 'neo4j'

    ROOT_CONTAINER_ID = 371

    JWT_AUTH_URL_RULE = None

    # GUID service
    GUID_URL = "http://10.3.1.120:5001"
    # GUID_URL = "https://vhg.indocresearch.org"

    #REDCap
    REDCAP_URL = 'https://redcap-internal.indocresearch.org/api/'

    VENDOR_NAMES = ['fitbit']

    NFS_ROOT_PATH = "/mnt/canarie/fitbit_data"
    # ROOT_PATH = {
    #     "vre": "/vre-data"
    # }.get(os.environ.get('namespace'), "/data/vre-storage")
    path_to_file = '/home/pcadmin/IndocPDG/canarie-2.0/backend/mnt/canarie/fitbit_data'
