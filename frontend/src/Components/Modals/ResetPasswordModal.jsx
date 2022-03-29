import React, { useState, useEffect } from 'react';
import { Modal, Button, message, Form, Input, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { changePassword } from '../../APIs';

const ResetPasswordModal = (props) => {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation(['message']);

  useEffect(() => {
    const info = { username: props.username };
    setUserInfo(info);
  }, [props.visible, props.username]);

  const FormInstance = React.createRef();

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onCancel = () => {
    props.handleCancel();
    FormInstance.current.resetFields();
  };

  const onOk = () => {
    setLoading(true);

    FormInstance.current
      .validateFields()
      .then((values) => {
        if (
          values.password === values.newPassword ||
          values.newPassword !== values.newPassword2
        ) {
          setLoading(false);
          return;
        }

        changePassword({
          old_password: values.password,
          new_password: values.newPassword,
          username: props.username,
        })
          .then((res) => {
            if (res && res.status === 200) {
              message.success(t('message:users.resetPassword.success'));
              setLoading(false);
              form.resetFields();
              props.handleCancel();
            }
          })
          .catch((err) => {
            if (err.response && err.response.status === 400) {
              message.error(t('message:users.resetPassword.oldPassword.valid'));
            } else {
              message.error(t('message:users.resetPassword.fail'));
            }

            setLoading(false);
          });
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const onPasswordChange = (e) => {
    form.setFieldsValue(e.target.value);

    const confirmPassword = form.getFieldValue('newPassword2');

    if (!confirmPassword || e.target.value === confirmPassword) {
      form.validateFields(['newPassword2'], () => Promise.resolve());
    } else if (confirmPassword && e.target.value !== confirmPassword) {
      form.validateFields(['newPassword2'], () => Promise.reject());
    }
  };

  return (
    <Modal
      title="Reset Password"
      visible={props.visible}
      maskClosable={false}
      closable={false}
      destroyOnClose={true}
      footer={[
        <Button
          id={'reset_password_modal_cancel'}
          key="back"
          onClick={onCancel}
          disabled={loading}
        >
          Close
        </Button>,
        <Button
          id={'reset_password_modal_submit'}
          key="submit"
          type="primary"
          loading={loading}
          onClick={onOk}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        name="basic"
        initialValues={userInfo}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        ref={FormInstance}
        form={form}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: t('message:users.resetPassword.username.empty'),
            },
          ]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Old Password"
          name="password"
          rules={[
            {
              required: true,
              message: t('message:users.resetPassword.oldPassword.empty'),
            },
          ]}
        >
          <Input.Password
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            autocomplete="off"
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              New Password&nbsp;
              <Tooltip title={t('password')}>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="newPassword"
          rules={[
            {
              required: true,
              message: t('message:users.resetPassword.newPassword.empty'),
              whitespace: true,
            },
            {
              pattern: new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_!%&/()=?*+#,.;])[A-Za-z\d-_!%&/()=?*+#,.;]{11,30}$/g,
              ),
              message: t('message:users.resetPassword.newPassword.valid'),
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  t('message:users.resetPassword.newPassword.valid'),
                );
              },
            }),
          ]}
          dependencies={['password']}
        >
          <Input.Password
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            autocomplete="off"
            onChange={onPasswordChange}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="newPassword2"
          rules={[
            {
              required: true,
              message: t(
                'message:users.resetPassword.confirmPassword.empty',
              ),
            },

            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  t('message:users.resetPassword.confirmPassword.valid'),
                );
              },
            }),
          ]}
        >
          <Input.Password
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            autocomplete="off"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
