import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, message, Badge, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import PlatformUsersTable from './PlatformUsersTable';
import { getInvitaions, updateInvitation } from '../../APIs';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

/**
 * Takes one prop: projectId. If projetId is given, the component will fetch the invitations on this proejct and not deisplay the project name
 *
 * @param {*} props
 * @returns
 */
function InvitationTable(props) {
  const [invitations, setInvitations] = useState(null);
  const [filters, setFilters] = useState({
    page: 0,
    pageSize: 10,
    orderBy: 'create_timestamp',
    orderType: 'desc',
    filters: {},
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState([]);
  const allProjects = useSelector((state) => state.studies.allStudies);

  const { t, i18n } = useTranslation(['message']);

  useEffect(() => {
    if (props.projectId) {
      const filtersWithProject = filters;
      filtersWithProject.filters.projectId = props.projectId;
      setFilters(filtersWithProject);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [filters, props.totalInvitations]);

  const fetchInvitations = () => {
    filters.filters.projectId = props.projectId;
    getInvitaions(filters)
      .then((res) => {
        const { page, result, total } = res.data;
        setInvitations(result);
        setTotal(total);
        setPage(page);
      });
  };

  const onChange = async (pagination, filterParam, sorter) => {
    let newFilters = Object.assign({}, filters);

    //Pagination
    setPage(pagination.current - 1);
    newFilters.page = pagination.current - 1;

    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
      newFilters.pageSize = pagination.pageSize;
    }

    //Search
    let searchText = [];

    if (filterParam.email && filterParam.email.length > 0) {
      searchText.push({
        key: 'email',
        value: filterParam.email[0],
      });

      newFilters.filters['email'] = filterParam.email[0];
    } else {
      delete newFilters.filters['email'];
    }

    if (filterParam.invited_by && filterParam.invited_by.length > 0) {
      searchText.push({
        value: filterParam.invited_by[0],
        key: 'invited_by',
      });

      newFilters.filters['invited_by'] = filterParam.invited_by[0];
    } else {
      delete newFilters.filters['invited_by'];
    }

    //Sorters
    if (sorter && sorter.order) {
      if (sorter.columnKey) {
        if (sorter.columnKey === 'email') {
          newFilters.orderBy = 'invitation_detail';
        } else {
          newFilters.orderBy = sorter.columnKey;
        }
      }
      newFilters.orderType = sorter.order === 'ascend' ? 'asc' : 'desc';
    }

    if (sorter && !sorter.order) {
      newFilters = {
        ...newFilters,
        orderBy: 'create_timestamp',
        orderType: 'desc',
      }
    }

    setFilters(newFilters);
    setSearchText(searchText);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };

  const handleReset = (clearFilters, dataIndex) => {
    clearFilters();
    let filters = searchText;
    filters = filters.filter((el) => el.key !== dataIndex);
    setSearchText(filters);
  };

  const invitationColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      width: '20%',
      searchKey: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'status',
      width: '10%',
      render: (text, record) => {
        if (text === false) {
          return (
            <div>
              <Badge status="error" />
              Cancelled
            </div>
          )
        } 

        const isExpired = getExpired(record);

        if (isExpired) {
          return (
            <div>
              <Badge status="default" />
              Expired
            </div>
          )
        }

        return (
          <div>
            <Badge status="success" />
            Active
          </div>
        )
      }
    },
    {
      title: 'Invited Time',
      dataIndex: 'create_timestamp',
      key: 'create_timestamp',
      sorter: true,
      width: '15%',
      render: (text) => text && moment(text*1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Expiration Time',
      dataIndex: 'expiry_timestamp',
      key: 'expiry_timestamp',
      sorter: true,
      width: '15%',
      render: (text) => text && moment(text*1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Project',
      dataIndex: 'projectId',
      key: 'project',
      width: '10%',
      render: (text) => {
        const project = allProjects.find(el => el.id === Number(text));

        if (project) {
          return project.name;
        }

        return 'No Project Assigned';
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: '5%',
      render: (text, record) => {
        const status = record.status;

        const menu = (
          <Menu>
            <Menu.Item onClick={() => {
              const code = record.invitation_code;
              if (status === 'pending') {
                updateInvitation(code, 'resend')
                  .then((res) => {
                    fetchInvitations();
                    setPage(0);
                    setPageSize(10);
                    message.success(t('message:invitation.patient.re-invite.success'))
                  })
                  .catch((err) => {
                    message.error(t('message:invitation.patient.re-invite.failed'));
                  })
              } else {
                message.warning('Patient already enrolled')
              }
              
            }}>
              Re-invite
            </Menu.Item>
            {
              status === 'pending' ? (
                <Menu.Item
                  onClick={() => {
                    const code = record.invitation_code;
                    updateInvitation(code, 'cancel')
                      .then((res) => {
                        fetchInvitations();
                        setPage(0);
                        setPageSize(10);
                        message.success(t('message:invitation.patient.cancel.success'))
                      })
                      .catch((err) => {
                        message.error(t('message:invitation.patient.cancel.failed'));
                      })
                  }}
                  style={{ color: 'red' }}
                >
                  Revoke Invitation
              </Menu.Item>
              ) : undefined
            }
          </Menu>
        );
        return (
          <Dropdown overlay={menu} placement="bottomRight">
            <Button shape="circle">
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const getExpired = (record) => {
    const current = moment();
    const isExpired = moment(
      record.expiry_timestamp * 1000,
    ).isBefore(current);
    return isExpired;
  };

  return (
    <PlatformUsersTable
      columns={invitationColumns}
      onChange={onChange}
      handleReset={handleReset}
      handleSearch={handleSearch}
      dataSource={invitations}
      totalItem={total}
      pageSize={pageSize}
      page={page}
      // setClassName={getExpired}
      {...props}
    />
  );
}

export default InvitationTable;
