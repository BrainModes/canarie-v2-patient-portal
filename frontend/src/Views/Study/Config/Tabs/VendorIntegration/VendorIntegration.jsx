import React from "react";
import { Checkbox, Table, Select, Button } from "antd";
import { useSelector } from "react-redux";
import styles from "./VendorIntegration.module.scss";

const { Option } = Select;
const VendorIntegration = (props) => {
	const user = useSelector((state) => state.user);
	const thirdPartyOptions = [
		{ label: "FitBit", value: "FitBit" },
		{ label: "Withings", value: "Withings" },
		{ label: "iHealth", value: "iHealth" },
	];

	const onThirdPartyChange = (checkedValues) => {
		props.updateDatasetInfo("thirdParty", checkedValues);
	};

	const colums = [
		{
			title: "Vendor",
			dataIndex: "vendor",
			key: "vendor",
			render: (text, record) => (
				<Select
					defaultValue={record.vendor && record.vendor[0]}
					disabled={true}
				>
					{record.vendor &&
						record.vendor.map((el) => (
							<Option value={el}>{el}</Option>
						))}
				</Select>
			),
		},
		{
			title: "Data Type",
			dataIndex: "dataType",
			key: "DataType",
			render: (text, record) => (
				<Select defaultValue="step count" disabled={true}>
					{record.dataType &&
						record.dataType.map((el) => (
							<Option value={el}>{el}</Option>
						))}
				</Select>
			),
		},
		{
			title: "Time Interval",
			dataIndex: "timeInterval",
			key: "TimeInterval",
			render: (text, record) => (
				<Select defaultValue="daily" disabled={true}>
					{record.timeInterval &&
						record.timeInterval.map((el) => (
							<Option value={el}>{el}</Option>
						))}
				</Select>
			),
		},
		{
			title: "Actions",
			key: "Actions",
			render: (text, record) => (
				<Button disabled={!props.editMode} type="link" disabled={true}>
					Delete
				</Button>
			),
		},
	];

	const data = [
		{
			vendor: ["Fitbit"],
			dataType: [
				"body mass index",
				"body weight",
				"heart rate",
				"physical activity",
				"sleep duration",
				"sleep episode",
				"step count",
			],
			timeInterval: ["weekly", "daily", "hourly"],
		},
	];
	return (
		<div>
			{
				<div className={styles.vendor_integration}>
					<div className={styles.third_party_integration}>
						<b className={styles.bold_text}>
							Third-party Integrations
						</b>
						<div className={styles.checkbox_section}>
							<p style={{ marginLeft: 30, fontSize: 12 }}>
								select a third-party application to enable
								authorization through Patient External Identity
								Management
							</p>

							<Checkbox.Group
								className={styles.custom_checkbox}
								options={thirdPartyOptions}
								onChange={onThirdPartyChange}
								style={{ marginLeft: 40 }}
								disabled={!props.editMode}
								defaultValue={props.datasetUpdate.thirdParty}
							/>
						</div>
					</div>
					<div className={styles.data_schedule}>
						<b className={styles.bold_text}>Data Schedule</b>
						<Table
							className={styles.table}
							columns={colums}
							dataSource={data}
							pagination={false}
							bordered={true}
						/>
					</div>
				</div>
			}
		</div>
	);
};

export default VendorIntegration;
