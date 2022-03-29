import { Table, Input, Button, Space, Badge, Tooltip } from 'antd';
import { SearchOutlined, CrownFilled } from '@ant-design/icons';
import React from 'react';

class PlatformUsersTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      page: 0,
      pageSize: 10,
      order: 'desc',
      sortColumn: 'createTime',
    };
  }

  statusMap = {
    active: 'success',
    disabled: 'error',
    pending: 'warning',
    hibernate: 'error',
    null: 'success',
  };

  getColumnSearchProps = (dataIndex, tableKey) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.props.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              this.props.handleSearch(selectedKeys, confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => this.props.handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? '#1890ff' : undefined, top: '60%' }}
      />
    ),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.select();
        }, 100);
      }
    },
    render: (text, record) => {
      if (dataIndex === 'name') {
        const status =
          tableKey === 'projectUsers' ? record.projectStatus : record.status;
        const statusBadge = (
          <Tooltip placement="top" title={status || 'active'}>
            <Badge status={this.statusMap[status]} />
          </Tooltip>
        );
        const adminCrown = record.role && record.role === 'admin' && (
          <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
        );
        return (
          <>
            {statusBadge}
            {text}
            {adminCrown}
          </>
        );
      } else if (
        tableKey &&
        tableKey === 'platformInvitations' &&
        dataIndex === 'email'
      ) {
        return (
          <>
            {text}
            {!record.projectId && record.role && record.role === 'admin' && (
              <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
            )}
          </>
        );
      } else if (
        tableKey &&
        tableKey === 'projectInvitations' &&
        dataIndex === 'email'
      ) {
        return (
          <>
            {text}
            {record.projectId && record.role && record.role === 'admin' && (
              <CrownFilled style={{ color: 'gold', marginLeft: 5 }} />
            )}
          </>
        );
      } else {
        return text;
      }
    },
  });

  render() {
    const {
      totalItem,
      page,
      pageSize,
      dataSource,
      width,
      setClassName,
      tableKey,
      style,
    } = this.props;

    const columns =
      this.props.columns &&
      this.props.columns.map((el) => {
        if (el.searchKey) {
          return {
            ...el,
            ...this.getColumnSearchProps(el.searchKey, tableKey),
          };
        }
        return el;
      });

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        onChange={this.props.onChange}
        pagination={{
          current: page + 1,
          pageSize,
          total: totalItem,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        key={this.props.tableKey}
        scroll={{ x: true }}
        // rowKey={(record) => record.name || record.email}
        width={width}
        rowClassName={setClassName} //This attribute takes a function to add classes to the row
        style={style}
      />
    );
  }
}

export default PlatformUsersTable;
