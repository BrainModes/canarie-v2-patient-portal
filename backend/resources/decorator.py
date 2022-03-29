from flask_jwt import current_identity
#from module_neo4j.ops_neo4j_base import Neo4jRelationship
from models.user_type import EUserRoleContainer, map_role_container, map_role_platform
from resources.utils import neo4j_obj_2_json, path_2_json
from config import ConfigClass
from functools import wraps
from flask import request
import requests
import os
from module_neo4j.py2neo import Neo4jClient
from resources.logger import Logger

logging = Logger(name=f'{os.path.basename(__file__)[:-3]}.log')

def check_role(required_role):
    def inner_function(function):
        required_role_mapped = map_role_container(required_role)

        @wraps(function)
        def wrapper(*args, **kwargs):
            logging.info(f'In decorator')
            user_id = current_identity["uid"]
            dataset_id = kwargs['dataset_id']
            dataset_id = int(dataset_id)
            role = current_identity["role"][0]
            role_mapped = map_role_container(role)
            logging.info(f'role_mapped: {role_mapped}')
            logging.info(f'role: {role}')
            logging.info(f'dataset_id: {dataset_id}')
            logging.info(f'user_id: {user_id}')
            logging.info(f'type: {type(user_id)}, {type(dataset_id)}')
            if  role_mapped == EUserRoleContainer.instance_admin:
                res = function(*args, **kwargs)
                return res

            try:
                neo4j_client = Neo4jClient()
                relation = neo4j_client.get_relation(None, user_id, dataset_id)
                logging.info(f'relation: {relation}')
                ## TODO update this
            #   type = None
            #   for i in result:
            #     type = next(iter(i.types()))
            #   if result:
            #       result = [{'p': path_2_json(result[0]), 'r': {"type": type, "status": result[0].get("status")}}]
                # relation_result = [neo4j_obj_2_json(x) for x in relation]
                # logging.info(f'relation_result: {relation_result}')

                relation_type, = relation[0].types()
                logging.info(f'relation_type: {relation_type}')

                if(len(relation) == 0):
                    raise Exception(
                        "Unauthorized: Relation does not exist.")
                if map_role_container(relation_type).value>= required_role_mapped.value:
                    res = function(*args, **kwargs)
                    return res
                else:
                    return {'result': 'Permission Deny'}, 401
            except Exception as e:
                return {'result': f'Permission Denied, detail information: {e}'}, 401

        return wrapper
    return inner_function


def check_site_role(required_role):
    def inner_function(function):
        required_role_mapped = map_role_platform(required_role)

        @wraps(function)
        def wrapper(*args, **kwargs):
            role = current_identity["role"][0]
            if map_role_platform(role).value >= required_role_mapped.value:
                res = function(*args, **kwargs)
                return res
            else:
                return {'result': 'Permission Denied'}, 401
        return wrapper
    return inner_function


