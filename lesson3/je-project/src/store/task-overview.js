import ActionTypes from "../action-types";

const initialState = {
  tasks: []
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.TASK_UNDER_EDIT_SAVED:
      return {
        ...state,
        tasks: state.tasks.concat(action.payload)
      };
    default:
      return state;
  }
}
