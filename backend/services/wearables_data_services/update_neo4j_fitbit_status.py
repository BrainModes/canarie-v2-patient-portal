from cron.py2neo_fn import Neo4jClient
from resources.utils import node_2_json


def update_fitbit_status():
    neo4j_client = Neo4jClient()
    admin_node = neo4j_client.query_node(label='user', params={"fitbit_status": "authorized"})
    admin_node_result = [node_2_json(x) for x in admin_node]
    print(admin_node_result)
    for user in admin_node_result:
        neo4j_client.update_node(label="user", id=int(user['id']), params={"fitbit_status": "unauthorized"})
        user_node = neo4j_client.get_node(None, int(user['id']))
        user_info = node_2_json(user_node)
        print(user_info)


update_fitbit_status()
