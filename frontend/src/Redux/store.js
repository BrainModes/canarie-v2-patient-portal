import { createStore } from "redux";
import rootReducer from "./Reducers";

const configureStore = () => {
	const store = createStore(
		rootReducer,
		window.__REDUX_DEVTOOLS_EXTENSION__ &&
			window.__REDUX_DEVTOOLS_EXTENSION__(),
	);

	if (process.env.NODE_ENV !== "production") {
		if (module.hot) {
			module.hot.accept("./Reducers", () => {
				store.replaceReducer(rootReducer);
			});
		}
	}

	return store;
};
const store = configureStore();

export { store };
