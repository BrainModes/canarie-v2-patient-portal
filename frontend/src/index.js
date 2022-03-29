import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { history } from "./Routes";
import "./i18n";

ReactDOM.render(
	<CookiesProvider>
		<Provider store={store}>
			<Router history={history}>
				<App />
			</Router>
		</Provider>
	</CookiesProvider>,
	document.getElementById("root"),
);
