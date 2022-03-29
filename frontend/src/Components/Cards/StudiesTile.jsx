import React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Row, Col, Card, Spin, Tag, message } from "antd";
import {
	EyeOutlined,
	EllipsisOutlined,
	StarOutlined,
	FileTextOutlined,
} from "@ant-design/icons";
import styles from "./index.module.scss";
import { useDispatch } from "react-redux";
import { setCurrentStudy } from "../../Redux/actions";

const { Meta } = Card;

function StudiesTile(props) {
	const [cookies] = useCookies();
	const { isLogin } = cookies;
	const { data } = props;
	const dispatch = useDispatch();

	function loginNotification() {
		message.success("Please login to perform this action.");
	}

	return (
		<Row gutter={16}>
			{data === null ? (
				<Spin />
			) : (
				<>
					{data.length === 0
						? "No study data available."
						: data.map((item, i) => (
								<Col
									xs={{ span: 24 }}
									sm={{ span: 12 }}
									md={{ span: 8 }}
									lg={{ span: 6 }}
									style={{ marginBottom: "16px" }}
									key={i} //todo: replace with study id
								>
									<Card
										cover={
											// <Link
											// 	to={`/study/${item.id}/landing`}
											// 	onClick={() => {
											// 		const studyId = item.id;
											// 		const currentStudy =
											// 			data &&
											// 			data.find(
											// 				(item) =>
											// 					item.id ===
											// 					Number(studyId),
											// 			);
											// 		dispatch(
											// 			setCurrentStudy(
											// 				currentStudy,
											// 			),
											// 		);
											// 	}}
											// >
											<FileTextOutlined
												className={styles.icon}
											/>
											// </Link>
										}
										key={i} //todo: replace with study id
										// actions={
										// 	isLogin
										// 		? [
										// 				<Link
										// 					to={`/study/${item.id}/landing`}
										// 				>
										// 					<EyeOutlined key="view" />
										// 				</Link>,
										// 				<StarOutlined
										// 					key="star"
										// 					onClick={() =>
										// 						message.success(
										// 							"Successfully starred the study.",
										// 						)
										// 					}
										// 				/>,
										// 				<EllipsisOutlined key="ellipsis" />,
										// 		  ]
										// 		: [
										// 				<Link to="/login">
										// 					<EyeOutlined
										// 						key="view"
										// 						onClick={
										// 							loginNotification
										// 						}
										// 						style={{
										// 							width:
										// 								"100%",
										// 						}}
										// 					/>
										// 				</Link>,
										// 				<Link to="/login">
										// 					<StarOutlined
										// 						key="star"
										// 						onClick={
										// 							loginNotification
										// 						}
										// 						style={{
										// 							width:
										// 								"100%",
										// 						}}
										// 					/>
										// 				</Link>,
										// 				<EllipsisOutlined key="ellipsis" />,
										// 		  ]
										// }
									>
										<Meta
											title={
												item.name ? (
													<>
														{item.name}{" "}
														{item.status ===
														"draft" ? (
															<Tag color="purple">
																Draft
															</Tag>
														) : (
															<Tag color="green">
																Recruiting
															</Tag>
														)}
													</>
												) : (
													"Study A"
												)
											}
											description={
												<div className={styles.desc}>
													{item.description
														? item.description
														: "Study description."}
												</div>
											}
										/>
									</Card>
								</Col>
						  ))}
				</>
			)}
		</Row>
	);
}

export default StudiesTile;
