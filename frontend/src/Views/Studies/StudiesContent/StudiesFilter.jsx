import React from "react";
import { useDispatch } from "react-redux";
import { Form, Input, Select, Button, Space } from "antd";

import { searchStudiesAPI, getStudiesAPI } from "../../../APIs";
import { setAllStudies } from "../../../Redux/actions";

const { Search } = Input;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
	children.push(
		<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>,
	);
}

function handleChange(value) {
	console.log(`selected ${value}`);
}

function StudiesFilter() {
	const [form] = Form.useForm();
	const dispatch = useDispatch();

	function reset() {
		form.resetFields();
		getStudiesAPI().then((res) => {
			dispatch(setAllStudies(res.data.items));
		});
	}

	function onFinish(values) {
		console.log("Received values of form:", values);
		// searchStudiesAPI(values).then((res) => {
		// 	dispatch(
		// 		setAllStudies(
		// 			typeof res.data.items === "string" ? [] : res.data.items,
		// 		),
		// 	);
		// });
	}

	return (
		<Form
			form={form}
			name="dynamic_form_item"
			onFinish={onFinish}
			layout="vertical"
			style={{ padding: "10px" }}
		>
			<Form.Item label={<strong>Name</strong>} name="study">
				<Input placeholder={"Search study name"} />
			</Form.Item>
			<Form.Item label={<strong>Study Status</strong>} name="status">
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="Recruiting, not yet recruiting"
					onChange={handleChange}
				>
					<Option key={"recruiting"}>Actively Recruiting</Option>
					<Option key={"developing"}>Recruitment not yet open.</Option>
					<Option key={"finished"}>Finished</Option>
					<Option key={"suspended"}>Suspended</Option>
				</Select>
			</Form.Item>
			<Form.Item
				label={<strong>Condition or disease</strong>}
				name="disease"
			>
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="e.g. breast canacer"
					onChange={handleChange}
				>
					<Option key={"Breast Canacer"}>Breast Canacer</Option>
					<Option key={"Health Behavior"}>Health Behavior</Option>
					<Option key={"Solid Tumor, Adult"}>
						Solid Tumor, Adult
					</Option>
					<Option key={"Squamous Cell Carcinoma of Head and Neck"}>
						Squamous Cell Carcinoma of Head and Neck
					</Option>
				</Select>
			</Form.Item>
			<Form.Item label={<strong>Location</strong>} name="location">
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="Select a location"
					onChange={handleChange}
				>
					<Option key={"BYC"}>BYC</Option>
					<Option key={"CAM"}>CAM</Option>
					<Option key={"SBH"}>SBH</Option>
					<Option key={"UBC"}>UBC</Option>
				</Select>
			</Form.Item>
			<Form.Item label={<strong>Keywords</strong>} name="keywords">
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="Select or search"
					onChange={handleChange}
				>
					{children}
				</Select>
			</Form.Item>
			<Form.Item
				label={<strong>Investigator</strong>}
				name="investigator"
			>
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="Select a user"
					onChange={handleChange}
				>
					<Option key={"Alana Sparks"}>Alana Sparks</Option>
					<Option key={"Sara Latour"}>Sara Latour</Option>
					<Option key={"Jon Gane"}>Jon Gane</Option>
					<Option key={"Sue Evans"}>Sue Evans</Option>
				</Select>
			</Form.Item>
			<Form.Item>
				<Space>
					<Button type="primary" htmlType="submit">
						Search
					</Button>
					<Button type="" onClick={reset}>
						Reset
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
}

export default StudiesFilter;
