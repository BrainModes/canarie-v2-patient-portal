import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Result } from "antd";
import styles from "./index.module.scss";

function CreateAccountConfirmation() {
	return (
		<div className={styles.confirmationWrapper}>
			<Card style={{ marginBottom: "10px" }}>
				<Result
					status="success"
					title="Registration: Successful"
					subTitle={
						<>
							<p>
								<br />A confirmation email will be sent to your
								email address soon.
								<br /> Please login with your new credentials.
							</p>
						</>
					}
					extra={[
						<Button type="primary" key="console">
							<Link to="/login">Back to log-in Page</Link>
						</Button>,
					]}
				/>
			</Card>
		</div>
	);
}

export default CreateAccountConfirmation;
