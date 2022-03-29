#
# this file is the basic operation on the neo4j includes
# add the node and relationship to fullfill the basic
# requirement on the neo4j
#
from models.custom_exception import ValidationError
from datetime import datetime
from neo4j import GraphDatabase
from config import ConfigClass


neo4j_connection = GraphDatabase.driver(ConfigClass.NEO4J_URL,
	auth=(ConfigClass.NEO4J_USER, ConfigClass.NEO4J_PASS),encrypted=False)


class Neo4jNode(object):
    # todo move the neo4j_connection here?

    # api will add the node in the neo4j
    # if parent_id appear in the parameter then it will also
    # create a relationship between two
    def add_node(self, label, name, param={}):
        neo4j_session = neo4j_connection.session()

        query = 'create (node:%s) set node=$param, node.name=$name , \
            node.time_created = datetime(), node.time_lastmodified = datetime() \
            return node' % (label)

        res = neo4j_session.run(query, param=param, name=name)
        parent_id = param.pop("parent_id", None)
        parent_relation = param.pop("parent_relation", None)

        if parent_id != None and parent_relation != None:
            nid = [x['node'].id for x in res][0]
            query = 'match (p1), (n:%s) \
                    where ID(p1) = $parent_id and ID(n) = $node_id \
                    set n.path = p1.path + "/" + n.path \
                    create p=(p1)-[:%s]->(n) \
                    return n as node' % (label, parent_relation)

            res = neo4j_session.run(query, parent_id=int(
                parent_id), node_id=int(nid))

        return res


    def get_node(self, label, id):
        neo4j_session = neo4j_connection.session()
        if label is None:
            query = 'match (node) where ID(node)=$nid return node'
        else:
            query = 'match (node:%s) where ID(node)=$nid return node' % (label)

        res = neo4j_session.run(query, nid=int(id))

        return res


    # update the node attribute by give id and parameter
    def update_node(self, label, id, params={}):
        neo4j_session = neo4j_connection.session()

        query = "match (node:%s) where ID(node)=%d set node = $params, \
            node.time_lastmodified = datetime() return node" % (label, id)

        res = neo4j_session.run(query, params=params)

        return res


    # use the params to generate the where clause in query
    def query_node(self, label, params=None):
        neo4j_session = neo4j_connection.session()
        query = 'match (node:%s) ' % (label)
        if(isinstance(params, dict)):
            query += 'where'
            for key, value in params.items():
                if type(value) == str:
                    value = "'%s'" % value
                query += " node.{key} = {value} and".format(
                    key=key, value=value)
            query = query[:-3]
        query += " return node"

        res = neo4j_session.run(query)
        return res

    # query node excluding specific labels in neo4j
    def query_node_exclude_label(self, label):
        neo4j_session = neo4j_connection.session()
        query = 'match (node) where not node:%s and not node:container return node' % (label)
        res = neo4j_session.run(query)
        return res

    # in order to facilitate the query in the frontend
    # we provide all the possible key with value with it
    def get_property_by_label(self, label):
        neo4j_session = neo4j_connection.session()

        query = 'MATCH (n:%s) UNWIND keys(n) as key \
            return key, collect(distinct n[key]) as options' % (label)

        res = neo4j_session.run(query)

        return res


class Neo4jRelationship(object):
    def relation_constrain_check(self, relation_label, dataset_id, target_dataset):
        # validate the target cannot add to itself
        # if there are common in intersection then abort it
        if set(dataset_id).intersection(target_dataset):
            return "cannot add yourself as parent/child", False

        # currently I dont have any better idea to check if we add the duplicate
        neo4j_session = neo4j_connection.session()
        query = 'match p=(n1)-[r]->(n2) where ID(n1) \
            in $dataset_id and ID(n2) in $target_dataset return n1'
        res = neo4j_session.run(
            query, dataset_id=dataset_id, target_dataset=target_dataset)

        # if we get some dataset then they are duplicate
        duplicate_dataset = [x[0].id for x in res]
        if len(duplicate_dataset):
            return "relations already exists" , False

        # impletement the cycle checking the dataset in child branch cannot be parent
        res = neo4j_session.run('match (n1)-[:PARENT*]->(n2) \
            where ID(n2) in $dataset_id and ID(n1) in $target_dataset return n2',
                                dataset_id=dataset_id, target_dataset=target_dataset)

        # if we get some dataset then they are cascade child dataset
        cascade_child_dataset = [x[0].id for x in res]
        if len(cascade_child_dataset):
            return 'You cannot add the cascaded child dataset as parent or the other way around.' \
                % (cascade_child_dataset), False

        return None, True


    # method allow to query the relationship
    # also the parameter allow the none so that we can query the 1-to-1
    def get_relation(self, start_id=None, end_id=None):
        query = 'match (start_node)-[r]->(end_node) '

        # now start add the start node and end node condition
        if start_id and end_id:
            query += 'where ID(start_node)=$start_id and ID(end_node)=$end_id '
        elif start_id:
            query += 'where ID(start_node)=$start_id '
        elif end_id:
            query += 'where ID(end_node)=$end_id '
        query += 'return type(r)'
        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, start_id=start_id, end_id=end_id)

        return res


    # this function will change the relation label between two node
    # since we cannot update the lable so we can only delete and add new one
    def update_relation(self, old_label, new_label, start_id, end_id):
        query = 'MATCH (n)-[rel:%s]->(m) where ID(n)=$start_id \
                    and ID(m)=$end_id MERGE (n)-[:%s]->(m) \
                    DELETE rel' % (old_label, new_label)

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, start_id=start_id, end_id=end_id)

        for x in res:
            print(res)

        return res


    # this function will delete relation between nodes
    def delete_relation(self, start_id, end_id):
        query = 'MATCH (n)-[rel]->(m) where ID(n)=$start_id \
                    and ID(m)=$end_id DELETE rel'

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, start_id=start_id, end_id=end_id)

        return res


    # note here it is not necessary to have label and parameter
    def get_relation_with_params(self, relation_label=None,
                                 start_label=None, end_label=None,
                                 start_params=None, end_params=None):
        def format_label(label):
            if(label):
                return ':'+label
            return ''

        relation_label = format_label(relation_label)
        start_label = format_label(start_label)
        end_label = format_label(end_label)

        query = 'match p=(start_node%s)-[r%s]->(end_node%s) ' % (
                start_label, relation_label,  end_label)

        if(isinstance(start_params, dict)):
            query += 'where'
            for key, value in start_params.items():
                if type(value) == str:
                    value = "'%s'" % value

                # id have special function
                if key == 'id':
                    query += ' Id(start_node) = {value} and'.format(value=value)
                else:
                    query += ' start_node.{key} = {value} and'.format(
                        key=key, value=value)
            query = query[:-3]

        if(isinstance(end_params, dict)):
            query += 'with * where'
            for key, value in end_params.items():
                if type(value) == str:
                    value = "'%s'" % value
                # id have special function
                if key == 'id':
                    query += ' Id(end_node) = {value} and'.format(value=value)
                else:
                    query += ' end_node.{key} = {value} and'.format(
                        key=key, value=value)
            query = query[:-3]
        query += 'return *'

        print(query)
        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query)

        return res


    def add_relation_between_nodes(self, relation_label, start_id, end_id):
        # now I only allow one be the array either start id or end id
        if type(start_id) == list and type(end_id) == list:
            raise Exception('Both start_id and end_id are list')

        if type(start_id) != list:
            start_id = [start_id]
        if type(end_id) != list:
            end_id = [end_id]

        # first check the all constrain
        constrain_res = self.relation_constrain_check(
            relation_label, start_id, end_id)

        if not constrain_res[1]:
            print(constrain_res[0])
            raise ValidationError(constrain_res[0],[start_id, end_id])

        # if every work fine add the relationship
        neo4j_session = neo4j_connection.session()
        query = 'match (start),(end) where ID(start) in $start_id and ID(end) in $end_id \
            create p=(start)-[:%s]->(end) return p' % (relation_label)
        res = neo4j_session.run(
            query, label=relation_label, start_id=start_id, end_id=end_id)
        print(query)
        print(relation_label, start_id, end_id)
        return res


    def add_relation_between_nodes_with_properties(self, relation_label, start_id, end_id, properties = {}):
        # now I only allow one be the array either start id or end id
        if type(start_id) == list and type(end_id) == list:
            raise Exception('Both start_id and end_id are list')

        if type(start_id) != list:
            start_id = [start_id]
        if type(end_id) != list:
            end_id = [end_id]

        # first check the all constrain
        constrain_res = self.relation_constrain_check(
            relation_label, start_id, end_id)

        if not constrain_res[1]:
            print(constrain_res[0])
            raise ValidationError(constrain_res[0],[start_id, end_id])

        if type(properties) != dict:
            print(type(properties))
            print(properties)
            raise TypeError("properties must be dict")


        # if every work fine add the relationship
        neo4j_session = neo4j_connection.session()
        query = 'match (start),(end) where ID(start) in $start_id and ID(end) in $end_id \
            create p=(start)-[:%s $properties]->(end) return p' % (relation_label)
        res = neo4j_session.run(
            query, label=relation_label, start_id=start_id, end_id=end_id, properties=properties)
        print(query)
        print(relation_label, start_id, end_id, properties)
        return res


    # method allow to query the nodes on other side of relation
    # also the parameter allow the none so that we can query the
    # 1-to-n, n-to-1 if start == True -> node_id-to-others
    def get_node_along_relation(self, relation_label, node_id, level, start=True):
        if level is not None:
            query = 'match r=(start_node)-[:%s*%s]->(end_node) ' % (relation_label, level)
        else:
            query = 'match r=(start_node)-[:%s*]->(end_node) ' % relation_label

        # now start add the start node and end node condition
        if start:
            query += 'where ID(start_node)=$node_id return end_node as node'
        else:
            query += 'where ID(end_node)=$node_id return start_node as node'

        neo4j_session = neo4j_connection.session()
        res = neo4j_session.run(query, node_id=node_id)

        return res


    # this is designed for when choosing adding the dataset
    # that the node should not either be in the parent tree or
    # the children tree
    def get_nodes_outside_relation(self, relation_label, current_dataset_id):
        neo4j_session = neo4j_connection.session()

        query = 'match (n),(n1) where not (n1)-[:%s]->(n) and not (n)-[:%s] \
            ->(n1) and ID(n1)=$dataset_id and not ID(n)=$dataset_id return n as node' % (relation_label, relation_label)

        res = neo4j_session.run(query, dataset_id=current_dataset_id)

        return res
