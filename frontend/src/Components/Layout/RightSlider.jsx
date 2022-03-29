import React from "react";
import { Layout } from "antd";

const { Sider } = Layout;

export default class RightSlider extends React.Component {
	state = {
		collapsed: true,
	};

	onCollapse = (collapsed) => {
		console.log(collapsed);
		this.setState({ collapsed });
	};
	render() {
		return (
			<Sider
				collapsible
				collapsed={this.state.collapsed}
				reverseArrow={true}
				theme="light"
				onCollapse={this.onCollapse}
			>
				{this.props.children}
			</Sider>
		);
	}
}
