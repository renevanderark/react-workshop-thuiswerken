import ActionTypes from "../action-types";

const initialState = {
  tasks: []
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    default:
      return state;
  }
}
