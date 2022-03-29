import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Typography, Row, Col, Button, Input, Card, Spin } from "antd";
import { RightOutlined, LeftOutlined, FilterOutlined } from "@ant-design/icons";

import AppFooter from "../../../Components/Layout/Footer";
import StudiesTile from "../../../Components/Cards/StudiesTile";
import LeftSider from "../../../Components/Layout/LeftSider";

import styles from "./index.module.scss";
import Filter from "./StudiesFilter";
import { useMobile } from "../../../Hooks";
import { searchStudiesAPI } from "../../../APIs";
import { setAllStudies } from "../../../Redux/actions";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

function StudiesContent() {
	const [collapsed, setCollapsed] = useState(true);
	const [filterPanel, setFilterPanel] = useState(false);
	const studies = useSelector((state) => state.publicStudies);

	const isMobile = useMobile();

	// Closes all the filter panels on screen resize
	useEffect(() => {
		const handleResize = () => {
			setCollapsed(true);
			setFilterPanel(false);
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

	function toggle() {
		setCollapsed(!collapsed);
	}

	function handleFilterPanel() {
		setFilterPanel(!filterPanel);
	}

	function onSearch(value) {
		const data = { study: value };
	}

	return (
		<>
			{/*  Sidebar only renders on desktop */}
			{!isMobile && (
				<LeftSider collapsed={collapsed}>
					<Filter />
				</LeftSider>
			)}

			<Content className={collapsed ? "content" : "contentOpen"}>
				{/*  Sidebar control only renders on desktop */}
				{!isMobile &&
					React.createElement(
						collapsed ? RightOutlined : LeftOutlined,
						{
							className: "toggle",
							onClick: toggle,
						},
					)}

				<div className={styles.container}>
					<Title level={2}>Discover Studies</Title>
					<Row style={{ marginBottom: "20px" }} gutter={8}>
						<Col xs={{ span: 24 }} sm={{ span: 12 }}>
							<Button type="link" style={{ paddingLeft: 0 }}>
								Enter Invitation Code
							</Button>
						</Col>
						<Col xs={{ span: 22 }} sm={{ span: 12 }}>
							<Search
								placeholder="Search study name"
								onSearch={(v) => onSearch(v)}
							/>
						</Col>

						{/* mobile filter */}
						{isMobile && (
							<>
								<Col xs={{ span: 2 }}>
									<Button
										type="primary"
										shape="circle"
										icon={<FilterOutlined />}
										onClick={handleFilterPanel}
									/>
								</Col>
								{filterPanel && (
									<Card className={styles.fileterContentOpen}>
										<Filter />
									</Card>
								)}
							</>
						)}
					</Row>
					{studies ? (
						studies.length > 0 ? (
							<StudiesTile data={studies} />
						) : (
							<>
								<br />
								<br />
								<br />
								<p>
									There aren’t any studies that match your
									search query. Ensure you entered all
									information correctly and try again.
								</p>
								<p>Need help?</p>
								<p>
									<a href="mailto:che@indocresearch.org">
										Contact administrator
									</a>
								</p>
								<br />
								<br />
								<br />
							</>
						)
					) : (
						<Spin />
					)}
				</div>
				<AppFooter />
			</Content>
		</>
	);
}

export default StudiesContent;
