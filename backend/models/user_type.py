from enum import Enum

class EUserRoleContainer(Enum):
    instance_admin = 3
    admin = 2
    member = 1

class EUserRolePlatform(Enum):
    instance_admin = 3
    container_requester = 2
    registered_user = 1

def map_role_container(role: str):
    '''
    return EUserRole Type
    '''
    return {
        'instance-admin': EUserRoleContainer.instance_admin,
        'admin': EUserRoleContainer.admin,
        'member': EUserRoleContainer.member
    }.get(role, None)


def map_role_platform(role: str):
    '''
    return EUserRole Type
    '''
    return {
        'instance-admin': EUserRolePlatform.instance_admin, 
        'container-requester': EUserRolePlatform.container_requester,
        'registered-user': EUserRolePlatform.registered_user
    }.get(role, None)
