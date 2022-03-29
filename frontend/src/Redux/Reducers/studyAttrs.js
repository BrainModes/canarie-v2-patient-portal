import { SET_ATTRS_ORDER, UPDATE_ATTRS_ORDER } from "../actionTypes";

const initial = {
    attrsOrder: [],
}

const studyAttributes = (state = initial, action) => {
    switch (action.type) {
        case SET_ATTRS_ORDER:
            return {
                attrsOrder: action.payload
            }
        case UPDATE_ATTRS_ORDER:
            return {
                attrsOrder: [...state.attrsOrder, action.payload]
            }
        default: 
            return state;
	}
};

export default studyAttributes;