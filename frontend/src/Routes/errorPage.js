import Error404 from "../Views/ErrorPage/404/Error404";
import Error403 from "../Views/ErrorPage/403/Error403";

const routes = [
	{
		path: "/404",
		component: Error404,
	},
	{
		path: "/403",
		component: Error403,
	},
];

export default routes;
