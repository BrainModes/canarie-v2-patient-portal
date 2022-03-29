import React, { useEffect, useState } from 'react';
import {
  CloseOutlined,
  FullscreenOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Typography, Modal, Form, Input } from 'antd';
import UserDetails from './UserDetails';
import ExternalIdentityManagement from './ExternalIdentity';

const { Panel } = Collapse;
const { Title } = Typography;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

function ScalableDetails(props) {
  const { close, width, record } = props;
  const [projectList, setProjectList] = useState([]);
  const [modalTitle, setModalTitle] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setProjectList([]);
  }, [record.name]);

  function onCancel() {
    setVisible(false);
  }
  
  return (
    <div
      style={{
        width: width,
        position: 'relative',
        minWidth: '180px',
        maxWidth: '700px',
        marginLeft: '10px'
      }}
    >
      <Button
        onMouseDown={props.mouseDown}
        type="link"
        style={{
          position: 'absolute',
          top: '50%',
          left: `-31px`,
          transform: 'translateY(-50%)',
          transition: 'none',
          cursor: 'ew-resize',
        }}
      >
        <PauseOutlined />
      </Button>
      <div style={{ position: 'relative' }}>
        <CloseOutlined
          onClick={close}
          style={{
            zIndex: '99',
            float: 'right',
            marginTop: '11px',
            marginRight: '15px',
            fontSize: '18px'
          }}
        />
        <Title level={4} style={{ lineHeight: '1.9' }}>
          Patient Information
        </Title>
      </div>
      <Collapse defaultActiveKey={['1']}>
        <Panel
          header="Container Membership"
          key="1"
        >
          <UserDetails record={record} location={props.location} studyId={props.studyId} />
        </Panel>
        <Panel
          header="External Identity Management"
          key="2"
        >
          <ExternalIdentityManagement record={record} studyId={props.studyId} />
        </Panel>
      </Collapse>
      <Modal
        visible={visible}
        onCancel={onCancel}
        title={modalTitle}
        width={400}
        footer={[
          <Button key="back" onClick={onCancel}>
            OK
          </Button>,
        ]}
      >
        <Form
          {...layout}
          name="basic"
        >
          <Form.Item
            label="Platform"
            name="platform"
            rules={[
              {
                required: true,
                message: 'Please input platform name!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Platform ID"
            name="platformId"
            rules={[
              {
                required: true,
                message: 'Please input platform ID!',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ScalableDetails;
