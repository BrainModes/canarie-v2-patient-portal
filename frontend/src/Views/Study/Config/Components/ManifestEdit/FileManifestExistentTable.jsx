import React, { useState, useEffect } from "react";
import {
	PlusOutlined,
	ExclamationCircleOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
} from "@ant-design/icons";
import { Button, Tag, Checkbox, Modal, Tooltip } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { setAttrOrder } from "../../../../../Redux/actions";
import styles from "../../index.module.scss";
import { MANIFEST_ATTR_TYPE } from "../manifest.values";
import AttrAddBar from "./AttrAddBar";
import AttrEditBar from "./AttrEditBar";
import { deleteAttribute } from "../../../../../APIs";
import { lineBreaker } from "../../../../../Utility";
import { v4 as uuidv4 } from "uuid";
const { confirm } = Modal;

function FileManifestExistentTable(props) {
	const mItem = props.mItem;
	const configEditMode = props.configEditMode;
	const tableColumns = ["Attribute Name", "Type", "Value", "Optional"];
	const [editMode, setEditMode] = useState("default");
	const { attrsOrder: attributesOrder} = useSelector((state) => state.studyAttributes);
	const [tableKey, setTableKey] = useState(uuidv4());
	const attrsOrderOrigin = props.currentStudy?.attrs_order
		? props.currentStudy?.attrs_order
		: props.mItem.attributes.map((attrItem) => "attr_" + attrItem.key);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setAttrOrder(attrsOrderOrigin)); 
	}, [])
	
	function attrType(type) {
		switch (type) {
			case MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE:
				return "Multiple Choice";
			case MANIFEST_ATTR_TYPE.TEXT:
				return "Text";
			default: {
			}
		}
		return "";
	}

	const onConfirm = async (item) => {
		const res = await deleteAttribute(item.studyId, `attr_${item.key}`);
		await props.loadManifest();
	};

	function showDeleteConfirm(item) {
		confirm({
			title: "Confirm deletion",
			icon: <ExclamationCircleOutlined />,
			content: `Are you sure delete attribute "${item.name}"?`,
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				onConfirm(item);
			},
			onCancel() {
				console.log("Cancel");
			},
		});
	}

	function moveUp(item) {
		const curPos = attributesOrder.indexOf("attr_" + item.key);
		if (curPos === 0) return;
		const orderCopy = [
			...attributesOrder.filter((attr) => attr !== "attr_" + item.key),
		];
		orderCopy.splice(curPos - 1, 0, "attr_" + item.key);
		//setAttrsOrder(orderCopy);
		dispatch(setAttrOrder(orderCopy));
		setTableKey(uuidv4());
	}
	function moveDown(item) {
		const curPos = attributesOrder.indexOf("attr_" + item.key);
		if (curPos === attributesOrder.length - 1) return;
		const orderCopy = [
			...attributesOrder.filter((attr) => attr !== "attr_" + item.key),
		];
		orderCopy.splice(curPos + 1, 0, "attr_" + item.key);
		//setAttrsOrder(orderCopy);
		dispatch(setAttrOrder(orderCopy));
		setTableKey(uuidv4());
	}

	let tableContent = [];
	let attrsList = mItem.attributes;
	if (attributesOrder) {
		attrsList = attrsList.sort((a, b) => {
			return (
				attributesOrder.indexOf("attr_" + a.key) -
				attributesOrder.indexOf("attr_" + b.key)
			);
		});
	}
	//console.log(attrsList);
	if (!configEditMode) {
		tableContent = attrsList.map((item) => {
			return (
				<tr key={mItem.id + "-" + item.id}>
					<td>{item.name}</td>
					<td>{attrType(item.type)}</td>
					<td>
						{item.value &&
						item.type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE
							? item.value.split(",").map((v, vInd) => {
									return <Tag key={vInd}>{v}</Tag>;
							  })
							: item.value && lineBreaker(item.value)}
					</td>
					<td></td>
					<td>
						<a onClick={() => showDeleteConfirm(item)}>Delete</a>
					</td>
				</tr>
			);
		});
	} else {
		tableContent = attrsList.map((item, i) => (
			<AttrEditBar
				key={`add-bar-end-step2-${i}`}
				manifestID={mItem.id}
				attributes={attrsList}
				setEditMode={setEditMode}
				loadManifest={props.loadManifest}
				tableColumns={tableColumns}
				currentStudy={props.currentStudy}
				currentAttribute={item}
				moveDown={moveDown}
				moveUp={moveUp}
			/>
		));
	}

	return (
		<>
			<table className={styles.manifest_table} key={tableKey}>
				<thead>
					<tr>
						<th style={{ width: 180 }}>Attribute Name</th>
						<th style={{ width: 180 }}>Type</th>
						<th>Value</th>
						<th style={{ width: 120 }}></th>
						<th style={{ width: 120 }}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{tableContent}

					{editMode === "add" ? (
						<AttrAddBar
							key="add-bar-end-step2"
							manifestID={mItem.id}
							attributes={mItem.attributes}
							setEditMode={setEditMode}
							loadManifest={props.loadManifest}
							tableColumns={tableColumns}
							currentStudy={props.currentStudy}
						/>
					) : (
						<tr key="add-bar-end-step1">
							<td
								style={{
									textAlign: "center",
								}}
								colSpan={5}
							>
								{configEditMode ? (
									<Tooltip title="You must save your study configuration changes before you can add study attributes">
										<Button
											className={styles.button}
											type="primary"
											icon={<PlusOutlined />}
											onClick={(e) => {
												setEditMode("add");
											}}
											disabled={configEditMode}
										>
											Add Attribute
										</Button>
									</Tooltip>
								) : (
									<Button
										className={styles.button}
										type="primary"
										icon={<PlusOutlined />}
										onClick={(e) => {
											setEditMode("add");
										}}
									>
										Add Attribute
									</Button>
								)}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</>
	);
}
export default FileManifestExistentTable;
