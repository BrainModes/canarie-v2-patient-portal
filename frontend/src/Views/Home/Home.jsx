import React from "react";
import { Button } from "antd";
import { StandardLayout } from "../../Components/Layout";
import { Link, withRouter } from "react-router-dom";

import AppFooter from "../../Components/Layout/Footer";
import StudiesTile from "../../Components/Cards/StudiesTile";
import styles from "./index.module.scss";
import { useCookies } from "react-cookie";

function Home(props) {
	const [cookies, setCookie] = useCookies();
	const { isLogin } = cookies;
	const {
		match: { path, params },
	} = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	return (
		<StandardLayout {...config} rightContent={""}>
			{/* Background container */}
			<section className={styles.hero}></section>
			{/* Hero content */}
			<section className={styles.heroContent}>
				<h1 className={styles.h1}>
					CANARIE <br />
					Patient Portal
				</h1>
				<p className={styles.subtitle}>The Patient Data Gateway.</p>
				<Link to={isLogin ? "/my-studies" : "/login"}>
					<Button type="primary">Discover Studies</Button>
				</Link>
			</section>

			<section className={styles.studies}>
				<div className={styles.content}>
					<h2>Recruiting Studies</h2>
					<StudiesTile data={[[], [], [], []]} />
				</div>
			</section>
			<div className={styles.footer}>
				<AppFooter />
			</div>
		</StandardLayout>
	);
}

export default withRouter(Home);
