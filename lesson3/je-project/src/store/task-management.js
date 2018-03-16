import ActionTypes from "../action-types";

const initialState = {
  taskUnderEdit: {
    taskName: "",
    contactEmail: "",
    isValid: false,
    id: null
  }
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
