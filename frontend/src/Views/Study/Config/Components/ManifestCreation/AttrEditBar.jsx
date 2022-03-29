import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Tag, Input, Select, message, Checkbox, Form } from 'antd';
import { MANIFEST_ATTR_TYPE } from '../manifest.values';
import { useTranslation } from 'react-i18next';
import {
  validateAttributeName,
  validateAttrValue,
} from '../../Utils/FormatValidators';
import styles from '../../index.module.scss';
function attrType(type) {
  switch (type) {
    case MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case MANIFEST_ATTR_TYPE.TEXT:
      return 'Text';
    default: {
    }
  }
  return '';
}
const { Option } = Select;
function AttrEditBar(props) {
  const attrItem = props.attr;
  const [type, setType] = useState(attrItem.type);
  const [value, setValue] = useState(
    attrItem.value ? attrItem.value.split(',') : [],
  );
  // const [currentDataset] = useCurrentProject();
  const [attrName, setAttrName] = useState(attrItem.name);
  const [loading, setLoading] = useState(false);
  const [optional, setOptional] = useState(attrItem.optional);
  const [errorMsg4Val, setErrorMsg4Val] = useState(null);
  const [errorMsg4Name, setErrorMsg4Name] = useState(null);
  const { t } = useTranslation(['message']);

  return (
    <tr>
      <td>
        <Form.Item
          {...(errorMsg4Name && {
            validateStatus: 'error',
            help: errorMsg4Name,
          })}
        >
          <Input
            value={attrName}
            onChange={(e) => {
              setAttrName(e.target.value);
              const { valid, err } = validateAttributeName(
                e.target.value,
                props.createdAttrs,
              );
              if (!valid) {
                setErrorMsg4Name(err);
                return;
              }
              setErrorMsg4Name(null);
            }}
          />
        </Form.Item>
      </td>
      <td>
        <Select
          defaultValue={attrType(attrItem.type)}
          onChange={(e) => {
            setType(e);
          }}
          style={{ width: '100%' }}
        >
          {Object.keys(MANIFEST_ATTR_TYPE).map((mkey) => {
            return (
              <Option key={mkey} value={MANIFEST_ATTR_TYPE[mkey]}>
                {attrType(MANIFEST_ATTR_TYPE[mkey])}
              </Option>
            );
          })}
        </Select>
      </td>
      <td>
        {type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE ? (
          <Form.Item
            {...(errorMsg4Val && {
              validateStatus: 'error',
              help: errorMsg4Val,
            })}
          >
            <Select
              mode="tags"
              defaultValue={attrItem.value ? attrItem.value.split(',') : []}
              className={styles.custom_select_tag}
              onChange={(value) => {
                setValue(value);
                for (let vitem of value) {
                  let { valid, err } = validateAttrValue(vitem);
                  if (!valid) {
                    setErrorMsg4Val(err);
                    return;
                  }
                }
                setErrorMsg4Val(null);
              }}
              style={{ width: '100%' }}
              tagRender={(props) => {
                const { label } = props;
                const { valid } = validateAttrValue(label);
                return (
                  <Tag {...props} color={valid ? 'default' : 'error'}>
                    {label}
                  </Tag>
                );
              }}
            ></Select>
          </Form.Item>
        ) : null}
        {type === MANIFEST_ATTR_TYPE.TEXT ? (
          <p>Value will be text or numeric entry (max. 100 characters)</p>
        ) : null}
      </td>
      <td>
        <Checkbox
          defaultChecked={optional}
          onChange={(e) => {
            setOptional(e.target.checked);
          }}
        />
      </td>
      <td>
        <Button
          style={{ border: 0, outline: 0, padding: 0, marginTop: -4 }}
          icon={<CheckOutlined />}
          loading={loading}
          onClick={async (e) => {
            const otherAttrs = props.createdAttrs.filter(
              (_attr, ind) => props.selAttrId !== ind,
            );
            const { valid, err } = validateAttributeName(attrName, otherAttrs);
            if (!valid) {
              message.error(err);
              return;
            }
            if (errorMsg4Val) {
              message.error(
                `${t(
                  'message:config.attribute.error',
                )}`,
              );
              return;
            }
            if (
              type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE &&
              (!value || value.length === 0)
            ) {
              message.error(
                `${t(
                  'message:config.attribute.multipleChoice.empty',
                )}`,
              );
              return;
            }
            setLoading(true);
            let valueNew;
            if (type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE) {
              if (value && value.length) {
                valueNew = value.join(',');
              } else {
                valueNew = '';
              }
            }
            if (type === MANIFEST_ATTR_TYPE.TEXT) {
              valueNew = null;
            }
            const newAttr = {
              // name: trimString(attrName),
              // project_code: currentDataset.code,
              type: type,
              value: valueNew,
              optional: optional,
            };
            const indexOfItem = props.createdAttrs.findIndex(
              (x) => x.name === props.attr.name,
            );
            const temp = [...props.createdAttrs];
            temp.splice(indexOfItem, 1, newAttr);
            props.setCreatedAttrs(temp);
            setLoading(false);
            props.setEditMode('default');
          }}
        >
          Ok
        </Button>
        <Button
          style={{ border: 0, outline: 0, padding: 0, marginTop: 4 }}
          icon={<CloseOutlined />}
          onClick={() => {
            setAttrName(attrName.name);
            setValue(attrItem.value.split(','));
            setType(attrName.type);
            setErrorMsg4Val(null);
            setOptional(attrName.optional);
            props.setEditMode('default');
          }}
        >
          Cancel
        </Button>
      </td>
    </tr>
  );
}

export default AttrEditBar;
