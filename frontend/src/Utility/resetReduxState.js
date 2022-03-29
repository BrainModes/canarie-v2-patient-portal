import { setIsLoginCreator, setRefreshModal } from "../Redux/actions";
import reduxActionWrapper from "./reduxActionWrapper";

const [setIsLoginDispatcher, setRefreshModalDispatcher] = reduxActionWrapper([
	setIsLoginCreator,
	setRefreshModal,
]);
/**
 * reset all redux states to the init
 */
function resetReduxState() {
	setIsLoginDispatcher(false);
	setRefreshModalDispatcher(false);
}

export { resetReduxState };
