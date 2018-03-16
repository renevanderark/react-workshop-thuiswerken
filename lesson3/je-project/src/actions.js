import ActionTypes from "./action-types";

const updateTaskUnderEdit = (newValues) => {
  return {
    type: ActionTypes.UPDATE_TASK_UNDER_EDIT,
    payload: {
      contactEmail: {
        value: newValues.contactEmail,
        isValid: !!newValues.contactEmail.match(/.+\@.+\..+/)
      },
      taskName: {
        value: newValues.taskName,
        isValid: newValues.taskName.length > 3
      }
    }
  };
};

const mockAjaxSave = (request, onResponse) => {
  const responseBody = JSON.stringify({
    contactEmail: request.data.contactEmail.value,
    taskName: request.data.taskName.value,
    id: `${Math.random() * new Date().getTime()}`,
    timeStamp: new Date().getTime(),
    status: "wachtrij"
  });

  setTimeout(() => onResponse(
    null, { status: 200, body: responseBody }, responseBody
  ), 2000)
}

const saveTaskUnderEdit = () => (dispatch, getState) => {
  const taskUnderEdit = getState().taskManagement.taskUnderEdit;
  if (taskUnderEdit.contactEmail.isValid && taskUnderEdit.taskName.isValid) {
    dispatch({type: ActionTypes.SAVING_TASK_UNDER_EDIT});
    mockAjaxSave({
      data: taskUnderEdit
    }, (error, response, body) => {
      dispatch({type: ActionTypes.TASK_UNDER_EDIT_SAVED, payload: JSON.parse(body) })
    });
  }
};

// de action creator:
export default function(dispatch) {
  return {
    onTaskUnderEditChange: (newValues) => dispatch(updateTaskUnderEdit(newValues)),
    onSaveTaskUnderEdit: () => dispatch(saveTaskUnderEdit())
  };
}
