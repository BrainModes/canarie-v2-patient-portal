import appRoutes from "./app";
import studyRoutes from "./study";
import errorPageRoutes from "./errorPage";
import registrationRoutes from "./registration";
import invitationsRoutes from "./invitations";
import forgetPasswordRoutes from "./forgetPassword"
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

export {
	appRoutes,
	studyRoutes,
	errorPageRoutes,
	history,
	registrationRoutes,
	invitationsRoutes,
	forgetPasswordRoutes,
};
