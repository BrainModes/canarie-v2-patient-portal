import React from 'react';

import { Table, Typography } from 'antd';

const { Paragraph } = Typography;

function UserProjectsTable(props) {
  const { dataSource, platformRole } = props;
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name > b.name ? 1 : -1),
      width: '65%',
      searchKey: 'name',
      render: (text, record) => {
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 2,
                expandable: true,
              }}
              style={{ wordBreak: 'break-word', marginBottom: 0 }}
            >
              {text}
              <br />
            </Paragraph>
            <span style={{ color: 'rgba(0,0,0,.3)', fontSize: 11 }}>
              Project code: {record.code}
            </span>
          </>
        );
      },
    },
    {
      title: 'Role',
      dataIndex: 'permission',
      key: 'permission',
      sorter: (a, b) => a.permission.localeCompare(b.permission),
      width: '35%',
      searchKey: 'permission',
      render: (text) => {
        if (text === 'admin') {
          if (platformRole === 'admin') {
            text = 'Platform Administrator';
          } else {
            text = 'Project Administrator';
          }
        }

        return text;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      scroll={{ x: true }}
      rowKey={(record) => record.id}
      pagination={{ simple: true }}
    />
  );
}

export default UserProjectsTable;
