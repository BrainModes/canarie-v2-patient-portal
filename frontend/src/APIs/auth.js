import { serverAxios as axios } from "./config";

function login(data) {
	return axios({
		url: "/v1/users/login",
		method: "POST",
		data: { ...data, realm: "canarie" },
	});
}

export { login };
