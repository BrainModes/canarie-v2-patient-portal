import Landing from "../Views/Study/Landing/Landing";
import Members from "../Views/Study/Patients/Patients";
import Config from "../Views/Study/Config/Config";
import Researchers from "../Views/Study/Researchers/Researchers";
import Survey from "../Views/Study/Survey/Survey";
import SmartWatch from "../Views/Study/SmartWatch/SmartWatch";

const routes = [
	{
		path: "/landing",
		component: Landing,
	},
	{
		path: "/patients",
		component: Members,
		protected: true,
	},
	{
		path: "/config",
		component: Config,
	},
	{
		path: "/survey",
		component: Survey,
	},
	{
		path: "/smartwatch",
		component: SmartWatch,
	},
	{
		path: "/researchers",
		component: Researchers,
		protected: true,
	},
];

export default routes;
