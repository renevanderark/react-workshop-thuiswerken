import ActionTypes from "./action-types";
import xhr from "xhr";


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

const fetchTasks = () => (dispatch) => {
  dispatch({type: ActionTypes.REQUEST_TASKS});

  xhr({ url: "/tasks", method: "GET", headers: { "Accept": "application/json"} },
    (err, resp, body) => {
      dispatch({type: ActionTypes.RECEIVE_TASKS, payload: JSON.parse(body)})
    }
  );
};

const saveTaskUnderEdit = () => (dispatch, getState) => {
  const taskUnderEdit = getState().taskManagement.taskUnderEdit;
  if (taskUnderEdit.contactEmail.isValid && taskUnderEdit.taskName.isValid) {
    dispatch({type: ActionTypes.SAVING_TASK_UNDER_EDIT});
    xhr({
      url: "/tasks",
      method: "POST",
      headers: { "Accept": "application/json", "Content-type": "application/json" },
      data: JSON.stringify({
        contactEmail: taskUnderEdit.contactEmail.value,
        taskName: taskUnderEdit.taskName.value
      })
    }, (error, response, body) => {
      dispatch({type: ActionTypes.TASK_UNDER_EDIT_SAVED }); // we blijven deze versturen, maar de naam klopt dus niet in alle gevallen.
      if (error != null) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: "Fout bij het opslaan" });
      } else if (response.statusCode < 200 || response.statusCode >= 400) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: `${response.statusCode} - ${JSON.parse(body).message}` });
      }
    });
  }
};

const pressPlay = (taskId) => (dispatch) => {
  xhr({
    url: `/tasks/${taskId}/start`,
    method: "PUT",
    headers: { "Accept": "application/json", "Content-type": "application/json" }
  }, (error, response, body) => {
    if (error != null) {
      dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: "Fout met het starten" });
    } else if (response.statusCode < 200 || response.statusCode >= 400) {
      dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: `${response.statusCode} - ${JSON.parse(body).message}` });
    }
  });
}

// de action creator:
export default function(dispatch) {
  return {
    onTaskUnderEditChange: (newValues) => dispatch(updateTaskUnderEdit(newValues)),
    onSaveTaskUnderEdit: () => dispatch(saveTaskUnderEdit()),
    onFetchTasks: () => dispatch(fetchTasks()),
    onRemoveMessage: (messageIndex) => dispatch({type: ActionTypes.ON_REMOVE_MESSAGE, messageIndex: messageIndex}),
    onPressPlay: (taskId) => dispatch(pressPlay(taskId))
  };
}
