import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import {
 PlusOutlined,
 EditOutlined,
} from '@ant-design/icons';
import { addPlatformGUID, deletePlatformGUID } from '../../APIs';

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class PlatformTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "Platform",
        dataIndex: "platform",
        key: "platform",
        editable: true,
      },
      {
        title: "Platform ID",
        dataIndex: "platformId",
        key: "platformId",
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];
    this.state = {
      dataSource: [],
      count: 2,
      newRecord: {},
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dataSource !== this.props.dataSource) this.setState({ dataSource: this.props.dataSource});
  }

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    const deletedPlatform = dataSource.find(item => item.key === key);
    deletePlatformGUID(this.props.studyId, this.props.userId, deletedPlatform.platform, deletedPlatform.platformId)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            dataSource: dataSource.filter((item) => item.key !== key),
          });
        }
      })
  };

  handleAdd = () => {
    const { count, dataSource, newRecord } = this.state;
    const newData = {
      key: count,
      ...newRecord
    };
    addPlatformGUID(this.props.studyId, this.props.userId, newData.platform, newData.platformId)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1,
            newRecord: {},
          });
        }
      });
  };

  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    const addContent = (
      <div style={{ maxWidth: '200px' }}>
        <span>Platform</span>
        <Input
          onChange={(e) => {
            const record = { ...this.state.newRecord };
            record['platform'] = e.target.value;
            this.setState({ newRecord: record });
          }} 
        />
        <span>Platform ID</span>
        <Input 
          onChange={(e) => {
            const record = { ...this.state.newRecord };
            record['platformId'] = e.target.value;
            this.setState({ newRecord: record });
          }} 
        />
      </div>
    )
    return (
      <div>
        <Popconfirm
          title={addContent}
          okText="Yes"
          cancelText="No"
          icon={<EditOutlined />}
          onConfirm={this.handleAdd}
        >
          <Button
            type="dashed"
            style={{
              marginBottom: 16,
            }}
            icon={<PlusOutlined/>}
          >
            Add a Record
          </Button>
        </Popconfirm>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

// ReactDOM.render(<PlatformTable />, mountNode);

export default PlatformTable;