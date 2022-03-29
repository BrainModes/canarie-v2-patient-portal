import { InviteContent } from "../Views/Invitations/InviteContent";

const routes = [
	{
		path: "/:invitationHash",
		component: InviteContent,
	},
];

export default routes;
