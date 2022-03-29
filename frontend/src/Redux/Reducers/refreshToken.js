import { SET_REFRESH_MODAL } from "../actionTypes";

const init = false;
function refreshTokenModal(state = init, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_REFRESH_MODAL: {
      return payload;
    }
    default: {
      return state;
    }
  }
}

export default refreshTokenModal;
