from config import ConfigClass
from neo4j import GraphDatabase

# first check the necessary config parameter
required_parameters = ["NEO4J_URL", "NEO4J_PASS", "NEO4J_USER"]
for x in required_parameters:
	if not getattr(ConfigClass, x, None):
		raise Exception("Error: Missing the attribute %s in config."%x)


neo4j_connection = GraphDatabase.driver(ConfigClass.NEO4J_URL,
	auth=(ConfigClass.NEO4J_USER, ConfigClass.NEO4J_PASS),encrypted=False)