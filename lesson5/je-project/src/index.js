import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from "redux-thunk";
import { Provider } from "react-redux";

import taskManagementReducer from "./store/task-management";
import taskOverviewReducer from "./store/task-overview";
import messagesReducer from "./store/messages";

import actionCreator from "./actions";
import App from "./components/App";
import Header from "./components/layout/Header";
import Messages from "./components/messages/Messages";
import NewTask from "./components/task-management/NewTask";
import EditTask from "./components/task-management/EditTask";
import TaskOverview from "./components/task-overview/TaskOverview";
import ActionTypes from "./action-types";

import makeRouter from "./router";

const { navigateTo, mapRoutes } = makeRouter();

const store = createStore(combineReducers({
  taskManagement: taskManagementReducer,
  taskOverview: taskOverviewReducer,
  messages: messagesReducer
}), applyMiddleware(thunk));

const {
  onTaskUnderEditChange,
  onSaveTaskUnderEdit,
  onFetchTasks,
  onRemoveMessage,
  onPressPlay,
  onShowEdit
} = actionCreator(store.dispatch, navigateTo);

mapRoutes({
  '/': (params) => store.dispatch({type: ActionTypes.SHOW_MAIN}),
  '/:taskId/edit': (params) => onShowEdit(params.taskId)
});

onFetchTasks(); // haal eerste keer takenlijst op via xhr actionCreator
const tasksClient = new WebSocket('ws://localhost:3000/tasks');



tasksClient.onmessage = (msg) => store.dispatch({
  type: ActionTypes.RECEIVE_TASKS,
  payload: JSON.parse(msg.data)
});

window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.3">Takenbeheer</Header>
        <Messages onRemoveMessage={onRemoveMessage} />
        <NewTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <EditTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <TaskOverview navigateTo={navigateTo} onPressPlay={onPressPlay} />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
