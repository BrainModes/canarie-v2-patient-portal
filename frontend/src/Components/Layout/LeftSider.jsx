import React, { Component } from "react";
import { Layout } from "antd";
import {
	LeftCircleOutlined,
	RightCircleOutlined
} from "@ant-design/icons";
import styles from "./index.module.scss";

const { Sider } = Layout;

export default class QueryCard extends Component {
	state = {
		collapsed: false,
	};

	onCollapse = () => {
		this.setState({ collapsed: true });
	};

	offCollapse = () => {
		this.setState({ collapsed: false })
	}

	render() {
		const { title } = this.props;
		
		return (
			<Sider
				trigger={null}
				collapsed={this.state.collapsed}
				reverseArrow={true}
				zeroWidthTriggerStyle={{
					backgroundColor: "white",
					right: "-23px",
				}}
				className={styles.sider}
				theme="light"
			>
				<div className={styles.content}>
					{/* {title && <p className={styles["left-sider"]}>{title}</p>} */}
					{this.props.children}
					{this.state.collapsed ? (
						<RightCircleOutlined
							className={styles.right_circle_icon}
							onClick={this.offCollapse}
						/>
					) : (
						<LeftCircleOutlined
							className={styles.left_circle_icon}
							onClick={this.onCollapse}
						/>
					)}
				</div>
			</Sider>
		);
	}
}
