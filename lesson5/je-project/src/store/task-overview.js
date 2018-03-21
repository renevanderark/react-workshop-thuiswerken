import ActionTypes from "../action-types";

const initialState = {
  tasks: [],
  pending: false,
  isVisible: true
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.REQUEST_TASKS:
      return {
        ...state,
        tasks: [],
        pending: true
      };
    case ActionTypes.RECEIVE_TASKS:
      return {
        ...state,
        tasks: action.payload,
        pending: false
      }
    default:
      return state;
  }
}
