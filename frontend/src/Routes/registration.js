import RegistrationConfirmation from "../Views/Registration/RegistrationConfirmation";
import Registration from "../Views/Registration/RegistrationContent";

const routes = [
	{
		path: "/confirmation",
		component: RegistrationConfirmation,
	},
	{
		path: "/",
		component: Registration,
	},
];

export default routes;
