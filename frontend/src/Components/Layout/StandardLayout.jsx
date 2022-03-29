import React, { useEffect, Suspense } from "react";
import { Layout } from "antd";
import AppHeader from "./Header";
import RightSlider from "./RightSlider";
import LeftSider from "./LeftSider";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import styles from "./index.module.scss";

const { Content } = Layout;

function StandardLayout(props) {
	const {
		observationVars = [],
		initFunc = () => {},
		rightContent,
		leftContent,
		children,
		//wrappedComponent,
	} = props;

	useEffect(initFunc, observationVars);
	return (
		<Suspense fallback="loading">
			<Layout style={{ minWidth: "1000px", overflowX: "auto" }}>
				<AppHeader />
				<Content className={styles.content}>
					<Layout>
						{leftContent && (
							<LeftSider>
								{leftContent}
							</LeftSider>
						)}
						{children}
						{rightContent && (
							<RightSlider>{rightContent}</RightSlider>
						)}
					</Layout>
				</Content>
			</Layout>
		</Suspense>
	);
}

export default withRouter(connect(null, null)(StandardLayout));
