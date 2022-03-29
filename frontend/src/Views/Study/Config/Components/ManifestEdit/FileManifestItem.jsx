import React, { useState } from 'react';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SaveOutlined,
  RedoOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, message } from 'antd';
// import { deleteManifest, updateManifest } from '../../../../../../../APIs';
import FileManifestExistentTable from './FileManifestExistentTable';
import { validateManifestName } from '../../Utils/FormatValidators';
import styles from '../../index.module.scss';
function FileManifestItem(props) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  let mItem = props.manifestList.find((v) => v.id === props.manifestID);

  const deleteConfirm = (
    <Modal
      title="Delete Attribute Template"
      visible={deleteModalVisible}
      onOk={async () => {
        setDeleteModalVisible(false);
      }}
      onCancel={() => setDeleteModalVisible(false)}
    >
      <p>
        Deleting attribute template is unrecoverable, are you sure you want to
        proceed?
      </p>
    </Modal>
  );

  return (
    <div key={mItem.id} className={styles.manifestList}>
      <>
        <b style={{ marginLeft: 24 }}>Study Attributes</b>
      </>

      <FileManifestExistentTable
        mItem={mItem}
        loadManifest={props.loadManifest}
        currentStudy={props.currentStudy}
        configEditMode={props.configEditMode}
      ></FileManifestExistentTable>
      {deleteConfirm}
    </div>
  );
}
export default FileManifestItem;
