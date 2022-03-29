import React, { useState } from "react";
import {
	CheckOutlined,
	CloseOutlined,
	ArrowDownOutlined,
	ArrowUpOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Button, Tag, Input, Select, message, Checkbox, Form } from "antd";
import { MANIFEST_ATTR_TYPE } from "../manifest.values";
import { setAttributes } from "../../../../../APIs";
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
function AttrEditBar(props) {
	const [attrName, setAttrName] = useState(props.currentAttribute.name);
	const [type, setType] = useState(props.currentAttribute.type);
	const [value, setValue] = useState(props.currentAttribute.value);
	const [loading, setLoading] = useState(false);
	const [errorMsg4Val, setErrorMsg4Val] = useState(null);
	const [errorMsg4Name, setErrorMsg4Name] = useState(null);
	const { t } = useTranslation(["message"]);

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
					defaultValue={attrType(type)}
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
							defaultValue={value}
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
			<td>
				<ArrowUpOutlined
					style={{ marginRight: 10 }}
					onClick={() => {
						props.moveUp(props.currentAttribute);
					}}
				/>

				<ArrowDownOutlined
					onClick={() => {
						props.moveDown(props.currentAttribute);
					}}
				/>
			</td>
			<td>
				{/* <Button
          style={{ border: 0, outline: 0, color: "#5B8C00", boxShadow: "none", background: "none" }}
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
                t(
                  'message:config.attribute.multipleChoice.empty',
                )
              );
              return;
            }
            setLoading(true);
            let valueNew = value;

            const currentStudy = props.currentStudy;
            const attrName2 = attrName.replaceAll(' ', '_')
            currentStudy[`attr_${attrName2}`] = valueNew;

            delete currentStudy.time_lastmodified;
            await setAttributes(currentStudy.id, currentStudy);

            await props.loadManifest();
            setLoading(false);
            props.setEditMode('default');
          }}
        >
        </Button>*/}
			</td>
		</tr>
	);
}

export default AttrEditBar;
