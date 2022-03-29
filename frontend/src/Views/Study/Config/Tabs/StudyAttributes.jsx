import React, { useState, useEffect, useCallback } from "react";
import { Form } from "antd";
import FileManifestItem from "../Components/ManifestEdit/FileManifestItem";

import { checkAttributes } from "../../../../APIs";
import _ from "lodash";
import { useTranslation } from "react-i18next";

function StudyAttributes(props) {
	const { t } = useTranslation(["errormessages", "success"]);
	const [importModalVisible, setImportModalVisible] = useState(false);
	const [manifestList, setManifestList] = useState([]);
	const [btnLoading, setBtnLoading] = useState(false);
	const [studyAttributes, setStudyAttributes] = useState([]);
	const [currentStudy, setCurrentStudy] = useState({});
	const [form] = Form.useForm();
	const loadManifest = useCallback(async () => {
		// expected attributes in neo4j would be like "attr_key1: value1(string | array)"
		const projectInfo = await checkAttributes(
			props.currentStudy && props.currentStudy.id,
		);
		const attrsOrder = props.currentStudy?.attrs_order;
		const result = projectInfo.data.result;

		setCurrentStudy(result);

		let attributes = [];
		const keys = Object.keys(result);

		for (const key of keys) {
			const value = result[key];
			if (key.startsWith("attr_") && value) {
				attributes.push({
					name: key.slice(5).replaceAll("_", " "),
					type:
						typeof value === "string" ? "text" : "multiple_choice",
					value: typeof value === "string" ? value : value.join(","),
					studyId: props.currentStudy.id,
					id: keys.indexOf(key),
					key: key.slice(5),
				});
			}
		}
		if (attrsOrder) {
			attributes.sort((a, b) => {
				return (
					attrsOrder.indexOf("attr_" + a.key) -
					attrsOrder.indexOf("attr_" + b.key)
				);
			});
		}
		const fakeAttribute = [
			{
				id: props.currentStudy.id,
				name: "File Attributes",
				attributes,
			},
		];
		setStudyAttributes(fakeAttribute);
		setManifestList(fakeAttribute);
	}, [props.currentStudy && props.currentStudy.id]);

	useEffect(() => {
		loadManifest();
	}, [loadManifest]);

	return (
		<>
			{manifestList.length
				? manifestList.map((mItem) => {
						return (
							<FileManifestItem
								key={mItem.id}
								manifestID={mItem.id}
								manifestList={manifestList}
								loadManifest={loadManifest}
								currentStudy={currentStudy}
								configEditMode={props.configEditMode}
							/>
						);
				  })
				: null}
		</>
	);
}

export default StudyAttributes;
