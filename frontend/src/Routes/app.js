import Home from "../Views/Home/Home";
import Login from "../Views/Login/Login";
import Registration from "../Views/Registration/Registration";
import Studies from "../Views/Studies/Studies";
import Study from "../Views/Study/Study";
import AdminUsers from "../Views/AdminUsers/AdminUsers";
import MyStudies from "../Views/MyStudies/MyStudies";
import ErrorPage from "../Views/ErrorPage/ErrorPage";
import Invitations from "../Views/Invitations/Invite";
import ForgetPassword from "../Views/ForgetPassword";

const routes = [
	{
		path: "/",
		component: Home,
		exact: true,
	},
	{
		path: "/login",
		component: Login,
		exact: true,
	},
	{
		path: "/registration",
		component: Registration,
	},
	{
		path: "/pwdreset",
		component: ForgetPassword,
	},
	{
		path: "/studies",
		component: Studies,
	},
	{
		path: "/my-studies",
		component: MyStudies,
		protected: true,
	},
	{
		path: "/study/:studyId",
		component: Study,
		protected: true,
	},
	{
		path: "/admin/users",
		component: AdminUsers,
		protected: true,
	},
	{ 	path: "/error", 
		component: ErrorPage 
	},
	{
		path: "/invite",
		component: Invitations,
	},
];

export default routes;
