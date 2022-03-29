import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n.use(initReactI18next)
	.use(Backend)
	.init({
		debug: false,
		lng: "en",
		ns: ["errormessages"],
		backend: {
			loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
		},
		react: {
			useSuspense: false,
		},
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});
export default i18n;
