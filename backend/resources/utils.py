import json
from neo4j.graph import Node, Relationship, Path
from config import ConfigClass
import requests
from datetime import timezone
import datetime
import logging
################################################### Simple Helpers ########################################
from sqlalchemy import inspect
from .logger import Logger
import os

logging = Logger(name=f'{os.path.basename(__file__)[:-3]}.log')

def helper_now_utc():
    dt = datetime.datetime.now()
    utc_time = dt.replace(tzinfo=timezone.utc)
    return utc_time


def node_2_json(obj):
    # print(obj)
    if hasattr(obj, "id"):
        temp = {
            'id': obj.id,
            'labels': list(obj.labels)
        }
    else:
        temp = {
            'id': obj.identity,
            'labels': list(obj.labels)
        }
    # add the all the attribute all together
    temp.update(dict(zip(obj.keys(), obj.values())))

    # update the timestamp
    try:
        temp['time_lastmodified'] = str(temp['time_lastmodified'])[:19]
        temp['time_created'] = str(temp['time_created'])[:19]
    except Exception as e:
        print(e)

    return temp


def path_2_json(obj):
    result = {}
    # loop over the query result
    # print(obj.relationships)
    # for x in obj:
    #     # print("\n\n")

    # print(previous)

    current_node_tree = result
    #     print(len(x))

    #     # loop over the relationship to make into json
    for r in obj.relationships:

        start_node = node_2_json(r.start_node)
        # print(start_node)
        temp = current_node_tree.get(start_node["name"], None)
        # print(temp)
        # if we are not at the end
        if not temp:
            # print("##########################")
            current_node_tree.update({
                start_node["name"]: {
                    "id": start_node["id"],
                    "children": {}
                }
            })
        current_node_tree = current_node_tree.get(
            start_node["name"])["children"]

        end_node = node_2_json(r.end_node)
        temp = current_node_tree.get(end_node["name"], None)
        if not temp:
            # print("##########################")
            current_node_tree.update({
                end_node["name"]: {
                    "id": end_node["id"],
                    "children": {}
                }
            })
    return result


# function will turn the neo4j query result of dataset
# and transform into dataset json object
# the input should be <Noe4j.Record> output will be flattend data in record
# please note here all the node should name as node in return
# all the path should name as p in return
def neo4j_obj_2_json(query_record):
    def make_json_by_type(obj):
        if type(obj) == Node:
            return node_2_json(obj)
        elif type(obj) == Path:
            return path_2_json(obj)
        else:
            # note here relationship is more genetic
            # if the relation give ()-[PARENT]->() the return
            # will be <abc.PARENT> so I use else with try to catch it
            try:
                relation = {"type": obj.type}
                if hasattr(obj, "_properties"):
                    for key, value in obj._properties.items():
                        relation[key] = value
                return relation
            except Exception as e:
                return None

    result = {}
    # print(query_record)
    for key, value in query_record.items():
        if isinstance(value, str):
            result['node']['permission'] = value
        else:
            result.update({key: make_json_by_type(value)})

    return result


"""
    This function will convert database query object to dictionary
    params : single row of database object
    returns : dictionary format
"""


def object_as_dict(obj):
    return {c.key: getattr(obj, c.key)
            for c in inspect(obj).mapper.column_attrs}

def create_redcap_record(redcap_token, container_guid):
    logging.info("crete_redcap_record".center(80, '='))
    try:
        data = {"record_id": str(container_guid)}
        payload = {
            "token": redcap_token,
            "content": "record",
            "format": "json",
            "type": "flat",
            "overwriteBehavior": "normal",
            "forceAutoNumber": 'false',
            'returnFormat': 'json',
            "data": '[{"record_id":"' + str(container_guid) + '"}]'
        }
        url = ConfigClass.REDCAP_URL
        res = requests.post(url, data=payload)
        logging.info(f"Redcap: {url}")
        logging.info(f"Redcap payload: {payload}")
        logging.info(f"redcap status: {res.status_code}")
        logging.info(f"redcap res text: {res.text}")
        res_json = res.json()
        return res_json
    except Exception as e:
        logging.error(f'Error creating redcap: {e}')
        raise e

