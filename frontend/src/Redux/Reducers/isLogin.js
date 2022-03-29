import { SET_IS_LOGIN } from "../actionTypes";
import {tokenManager} from '../../Service/tokenManager'

/**
 * the user logout creator may dispatch a action with an empty {}
 */
const init = Boolean(tokenManager.checkTokenUnExpiration());
function isLogin(state = init, action) {
  let { type, payload } = action;
  if(typeof payload!=='boolean'){
    payload = false;
  }
  switch (type) {
    case SET_IS_LOGIN: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default isLogin;
