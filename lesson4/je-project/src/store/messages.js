import ActionTypes from "../action-types";

const initialState = {
  messages: []
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.ON_ERROR_MESSAGE:
      return {
        messages: [{text: action.payload, level: "danger"}].concat(state.messages)
      };
    case ActionTypes.ON_REMOVE_MESSAGE:
      return {
        messages: state.messages.filter((_ignore, index) => index !== action.messageIndex)
      };
    default:
      return state;
  }
}
