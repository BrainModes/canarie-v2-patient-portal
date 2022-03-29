import React from "react";
import { Modal, Typography } from "antd";

const { Title } = Typography;

function TermsOfUseModal(props) {
	return (
		<Modal
			title="Platform Terms of Use Agreement"
			visible={props.visible}
			onOk={props.handleCancel}
			onCancel={props.handleCancel}
			width={"70%"}
			footer={props.footer}
			maskClosable={false}
			zIndex="1020"
		>
			<div style={{ overflowY: "scroll", height: "60vh" }}>
				<h1>Terms of use</h1>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
					tincidunt lacus enim, a feugiat massa congue ut. Ut aliquet
					et tellus sed tristique. Nullam gravida orci ut leo
					venenatis finibus. Donec vel elit eget elit molestie
					sollicitudin. Suspendisse faucibus iaculis eros vitae
					interdum. Nunc malesuada vehicula felis, eu finibus magna
					malesuada vel. Vestibulum ante ipsum primis in faucibus orci
					luctus et ultrices posuere cubilia curae; Donec scelerisque
					ante eu lacus facilisis hendrerit. Maecenas dapibus leo
					turpis, nec ultrices est malesuada quis. Cras placerat nisi
					nec ornare lobortis. Mauris convallis neque sed auctor
					rhoncus. Fusce malesuada vel turpis quis commodo. Duis eget
					lectus in lorem mollis rutrum. Mauris eu malesuada est, a
					mattis augue. Ut eu felis ultrices, porttitor quam sit amet,
					tempus tortor.
				</p>
				<p>
					Donec laoreet nulla eu volutpat ullamcorper. Phasellus
					lacinia eget quam vitae euismod. Aliquam a sapien erat. Sed
					id turpis magna. Fusce at lectus eget lacus pellentesque
					vulputate. Aenean at efficitur lacus, eget ultrices orci.
					Praesent id sagittis nisi. Interdum et malesuada fames ac
					ante ipsum primis in faucibus. Etiam lobortis vel dui vel
					gravida. Nulla ut arcu et tellus faucibus rhoncus. Curabitur
					tempor enim quis augue pretium semper. Nam nisi lacus,
					pretium vitae dictum non, fringilla sit amet lacus. Nullam
					tristique turpis quis elit tempor, id gravida ligula varius.
					Mauris id enim at magna imperdiet posuere tempor vel arcu.
					Aliquam erat volutpat. Nunc ullamcorper id mauris quis
					mollis. Curabitur vulputate fermentum lorem a egestas.
					Praesent id mauris quis turpis vulputate auctor eu lacinia
					mauris. Mauris quis volutpat nulla. Etiam pretium arcu in
					interdum interdum. Nulla hendrerit, leo et tempor venenatis,
					tellus risus rhoncus nunc, laoreet faucibus eros elit quis
					mi. Quisque tincidunt mi erat, sed ornare mi consequat quis.
					Mauris lacus lacus, sollicitudin nec laoreet id, euismod
					quis purus.
				</p>
				<p>
					Donec laoreet nulla eu volutpat ullamcorper. Phasellus
					lacinia eget quam vitae euismod. Aliquam a sapien erat. Sed
					id turpis magna. Fusce at lectus eget lacus pellentesque
					vulputate. Aenean at efficitur lacus, eget ultrices orci.
					Praesent id sagittis nisi. Interdum et malesuada fames ac
					ante ipsum primis in faucibus. Etiam lobortis vel dui vel
					gravida. Nulla ut arcu et tellus faucibus rhoncus. Curabitur
					tempor enim quis augue pretium semper. Nam nisi lacus,
					pretium vitae dictum non, fringilla sit amet lacus. Nullam
					tristique turpis quis elit tempor, id gravida ligula varius.
					Mauris id enim at magna imperdiet posuere tempor vel arcu.
					Aliquam erat volutpat. Nunc ullamcorper id mauris quis
					mollis. Curabitur vulputate fermentum lorem a egestas.
					Praesent id mauris quis turpis vulputate auctor eu lacinia
					mauris. Mauris quis volutpat nulla. Etiam pretium arcu in
					interdum interdum. Nulla hendrerit, leo et tempor venenatis,
					tellus risus rhoncus nunc, laoreet faucibus eros elit quis
					mi. Quisque tincidunt mi erat, sed ornare mi consequat quis.
					Mauris lacus lacus, sollicitudin nec laoreet id, euismod
					quis purus.
				</p>
				<br />
				<br />
			</div>
		</Modal>
	);
}

export default TermsOfUseModal;
