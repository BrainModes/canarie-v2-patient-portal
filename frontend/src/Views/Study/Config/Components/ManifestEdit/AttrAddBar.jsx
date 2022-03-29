import React, { useState } from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Button, Tag, Input, Select, message, Checkbox, Form } from "antd";
import { MANIFEST_ATTR_TYPE } from "../manifest.values";
import { setAttributes, getContainers } from "../../../../../APIs";
import { useSelector, useDispatch } from 'react-redux';
import { updateAttrOrder, setAllStudies } from "../../../../../Redux/actions";
import {
	validateAttributeName,
	validateAttrValue,
} from "../../Utils/FormatValidators";
import styles from "../../index.module.scss";
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
const { Option } = Select;
function AttrAddBar(props) {
	const [attrName, setAttrName] = useState(null);
	const [type, setType] = useState(MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE);
	const [value, setValue] = useState(null);
	const [loading, setLoading] = useState(false);
	const [errorMsg4Val, setErrorMsg4Val] = useState(null);
	const [errorMsg4Name, setErrorMsg4Name] = useState(null);
	const { t } = useTranslation(["message"]);
	const { attrsOrder } = useSelector(state => state.studyAttributes);
	const dispatch = useDispatch();

	return (
		<tr>
			<td>
				<Form.Item
					{...(errorMsg4Name && {
						validateStatus: "error",
						help: errorMsg4Name,
					})}
				>
					<Input
						value={attrName}
						onChange={(e) => {
							setAttrName(e.target.value);
							const { valid, err } = validateAttributeName(
								e.target.value,
								props.attributes,
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
					defaultValue="Multiple Choice"
					onChange={(e) => {
						setType(e);
					}}
					style={{ width: "100%" }}
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
							validateStatus: "error",
							help: errorMsg4Val,
						})}
					>
						<Select
							mode="tags"
							defaultValue={[]}
							onChange={(value) => {
								setValue(value);
								for (let vitem of value) {
									let { valid, err } =
										validateAttrValue(vitem);
									if (!valid) {
										setErrorMsg4Val(err);
										return;
									}
								}
								setErrorMsg4Val(null);
							}}
							className={styles.custom_select_tag}
							tagRender={(props) => {
								const { label } = props;
								const { valid } = validateAttrValue(label);
								return (
									<Tag
										{...props}
										color={valid ? "default" : "error"}
									>
										{label}
									</Tag>
								);
							}}
						></Select>
					</Form.Item>
				) : null}
				{type === MANIFEST_ATTR_TYPE.TEXT ? (
					<Form.Item
						{...(errorMsg4Val && {
							validateStatus: "error",
							help: errorMsg4Val,
						})}
					>
						<Input
							onChange={(e) => {
								setValue(e.target.value);
								const { valid, err } = validateAttrValue(
									e.target.value,
									props.attributes,
								);
								if (!valid) {
									setErrorMsg4Name(err);
									return;
								}
								setErrorMsg4Name(null);
							}}
						/>
					</Form.Item>
				) : null}
			</td>
			<td></td>
			<td>
				<Button
					style={{
						border: 0,
						outline: 0,
						color: "#5B8C00",
						boxShadow: "none",
						background: "none",
					}}
					icon={<CheckOutlined />}
					loading={loading}
					onClick={async (e) => {
						const { valid, err } = validateAttributeName(
							attrName,
							props.attributes,
						);
						if (!valid) {
							message.error(err);
							return;
						}
						if (errorMsg4Val) {
							message.error(
								`${t("message:config.attribute.error")}`,
							);
							return;
						}
						if (
							type === MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE &&
							(!value || value.length === 0)
						) {
							message.error(
								t(
									"message:config.attribute.multipleChoice.empty",
								),
							);
							return;
						}
						setLoading(true);
						let valueNew = value;

						const currentStudy = props.currentStudy;
						const attrName2 = attrName.replaceAll(" ", "_");
						currentStudy[`attr_${attrName2}`] = valueNew;
						dispatch(updateAttrOrder(`attr_${attrName2}`));
						currentStudy.attrs_order = [
							...attrsOrder,
							`attr_${attrName2}`,
						];
						delete currentStudy.time_lastmodified;
						await setAttributes(currentStudy.id, currentStudy);

						await props.loadManifest();
						setLoading(false);
						props.setEditMode("default");

						/* const res2 = await getPublicStudies();
						dispatch(setPublicStudies(res2.data.result)); */

						const containersResult = await getContainers();
						const containers = containersResult?.data?.result?.node;
						const studiesArr = containers.filter((item) => {
							if (item.labels[0] === "study") return { item };
						});
						dispatch(setAllStudies(studiesArr));
					}}
				></Button>
				<Button
					style={{
						border: 0,
						outline: 0,
						color: "#FF6D72",
						boxShadow: "none",
						background: "none",
					}}
					icon={<CloseOutlined />}
					onClick={() => {
						setAttrName(null);
						setValue(null);
						setType(MANIFEST_ATTR_TYPE.MULTIPLE_CHOICE);
						setErrorMsg4Val(null);
						props.setEditMode("default");
					}}
				></Button>
			</td>
		</tr>
	);
}

export default AttrAddBar;
