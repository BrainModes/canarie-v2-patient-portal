import React, { useEffect, useState } from "react";
import LandingHeader from "./LandingHeader/LandingHeader";
import LandingBody from "./LandingBody/LandingBody";
import styles from "./landing.module.scss";

function Landing(props) {
	return (
		<div className={styles.landing_content}>
			<LandingHeader currentStudy={props.currentStudy} />
			<LandingBody currentStudy={props.currentStudy} />
		</div>
	);
}

export default Landing;
