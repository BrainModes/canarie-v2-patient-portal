import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { connect, useSelector } from "react-redux";
import { setRefreshModal } from "../../Redux/actions";
// import { namespace, ErrorMessager } from "../../ErrorMessages";
import { tokenManager } from "../../Service/tokenManager";
import { userAuthManager } from "../../Service/userAuthManager";
// import { broadcastManager } from "../../Service/broadcastManager";
import { namespace as ServiceNamespace } from "../../Service/namespace";

function CreateDatasetModal({ visible, setRefreshModal }) {
	const [secondsToGo, setTimer] = useState(tokenManager.getTokenTimeRemain());
	const [listenerId, setListenerId] = useState("default");
	const { refreshTokenModal, username } = useSelector((state) => state);

	const refreshToken = () => {
		userAuthManager
			.extendAuth()
			.then((res) => {
				setRefreshModal(false); //Close this modal
			})
			.catch((err) => {
				if (err.response) {
					console.log(err);
				}
			});
	};

	useEffect(() => {
		if (refreshTokenModal) {
			const time = 250; //any value because condition always return true;
			const condition = (timeRemain, time) => true;
			const func = () => {
				setTimer(tokenManager.getTokenTimeRemain());
			};
			const newListenerId = tokenManager.addListener({
				time,
				condition,
				func,
			});
			setListenerId(newListenerId);
		} else {
			tokenManager.removeListener(listenerId);
		}
	}, [refreshTokenModal]);

	const logout = () => {
		tokenManager.removeListener(listenerId);
		userAuthManager.logout(
			ServiceNamespace.userAuthLogout.LOGOUT_REFRESH_MODAL,
		);
		// broadcastManager.postMessage(
		// 	"logout",
		// 	ServiceNamespace.broadCast.REFRESH_MODAL_LOGOUT,
		// );
	};

	return (
		<Modal
			title="Warning"
			visible={visible}
			maskClosable={false}
			// icon={<ExclamationCircleOutlined />}
			onCancel={() => {
				// setRefreshModal(false);
				logout();
			}}
			footer={[
				<Button key="back" onClick={logout}>
					Logout
				</Button>,
				<Button
					key="submit"
					type="primary"
					onClick={() => refreshToken()}
				>
					Refresh
				</Button>,
			]}
		>
			{`Your session will expire in ${secondsToGo}s. Please click “Refresh” if you wish to remain logged in.`}
		</Modal>
	);
}

// export default CreateDatasetModal;
export default connect(
	(state) => ({
		visible: state.refreshTokenModal,
	}),
	{ setRefreshModal },
)(CreateDatasetModal);
