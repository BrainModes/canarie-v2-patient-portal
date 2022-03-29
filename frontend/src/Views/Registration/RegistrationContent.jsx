import React from "react";

import CreateAccount from "../../Components/Form/CreateAccount";
import { message } from "antd";
import { register } from "../../APIs";
import styles from "./index.module.scss";
import { withRouter } from "react-router-dom";

function RegistrationContent(props) {
	const onSumbit = (values) => {
		register(values)
			.then((res) => {
				if (res.status === 200) {
					props.history.push("/registration/confirmation");
				} else {
					message.error("Something went wrong during registration. Please try again.");
				}
			})
			.catch((err) => {
				if (err.response) {
					const { result } = err.response.data;
					message.error(result);
				}
			});
	};
	return (
		<div className={styles.container}>
			<CreateAccount onSubmit={onSumbit} />
		</div>
	);
}

export default withRouter(RegistrationContent);
