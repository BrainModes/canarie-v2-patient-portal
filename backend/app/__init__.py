from flask_restful import Api
from flask import Flask, send_from_directory

from flask_jwt import JWT, JWTError
from module_keycloak.ops_admin import OperationsAdmin
#from module_neo4j.ops_neo4j_base import Neo4jNode
from resources.utils import neo4j_obj_2_json, node_2_json
from flask import Flask, request
from flask_cors import CORS
from config import ConfigClass
import jwt as pyjwt
from db import db
import importlib
from module_neo4j.py2neo import Neo4jClient
from werkzeug.routing import BaseConverter
import os
import re
dirname = os.path.dirname(__file__)


def create_app(extra_config_settings={}):
    # initialize app and config app
    app = Flask(__name__, static_folder=os.path.join(dirname, '../static/build'), static_url_path='')

    @app.errorhandler(404)
    def page_not_found(e):
        return app.send_static_file('index.html')

    app.config.from_object(__name__+'.ConfigClass')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(
        user="canarieadmin",
        pw="indocAdmin2020",
        url="10.3.9.205:5432",
        db="canarie")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['PROPAGATE_EXCEPTION'] = True
    app.secret_key = "canarie"
    CORS(
        app,
        origins="*",
        allow_headers=["Content-Type", "Authorization","Access-Control-Allow-Credentials"],
        supports_credentials=True,
        intercept_exceptions=False)

    @app.before_first_request
    def create_table():
        db.create_all()

    # dynamic add the dataset module by the config we set
    for apis in ConfigClass.api_modules:
        api = importlib.import_module(apis)
        api.module_api.init_app(app)

    jwt = JWT(app)

    @jwt.jwt_error_handler
    def error_handler(e):
        print("###### Error Handler")
        # Either not Authorized or Expired
        return {'result': 'jwt ' + str(e)}, 401

    # load jwt token from request's header
    @jwt.request_handler
    def load_token():
        print("###### Load Token")
        token = request.headers.get('Authorization')

        if not token:
            return token

        return token.split()[-1]

    # function is to parse out the infomation in the JWT
    @jwt.jwt_decode_handler
    def decode_auth_token(token):
        print("###### decode_auth_token by syncope")
        try:
            decoded = pyjwt.decode(token, verify=False)
            return decoded
        except Exception as e:
            raise JWTError(description='Error', error=e)

    # finally we pass the infomation to here to identify the user
    @jwt.identity_handler
    def identify(payload):
        print("###### identify")
        username = payload.get('preferred_username', None)
        node_client = Neo4jClient()

        # check if preferred_username is encoded in token
        if(not username):
            raise Exception("preferred_username is required in jwt token.")

        try:
            operations_admin = OperationsAdmin('canarie')
            userid = operations_admin.get_user_id(username)
            user = operations_admin.get_user_info(userid)
            user_node = node_client.query_node('user',{"name": username})
            user_node_id = [node_2_json(x) for x in user_node][0]['id']
        except Exception as e:
            raise JWTError(description='Error', error=e)

        return {
            'uid': user_node_id,
            'username': user['username'],
            'role': user['attributes'].get('user_role'),
            'email': user['email'],
            'first_name': user['firstName'],
            'last_name': user['lastName'],
            'enabled':user['enabled']}

    db.init_app(app)
    return app
