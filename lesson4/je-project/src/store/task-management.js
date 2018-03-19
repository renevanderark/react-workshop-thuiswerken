import ActionTypes from "../action-types";

const initialState = {
  taskUnderEdit: {
    taskName: {value: "", isValid: false},
    contactEmail: {value: "", isValid: false},
    id: null
  },
  saving: false
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.SAVING_TASK_UNDER_EDIT:
      return {
        ...state,
        saving: true
      };
    case ActionTypes.TASK_UNDER_EDIT_SAVED:
      return initialState;
    case ActionTypes.UPDATE_TASK_UNDER_EDIT:
      return {
        ...state,
        taskUnderEdit: {
          ...state.taskUnderEdit,
          contactEmail: action.payload.contactEmail,
          taskName: action.payload.taskName
        }
      }
    default:
      return state;
  }
}
