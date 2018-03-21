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
  onPressPlay
} = actionCreator(store.dispatch, navigateTo);

mapRoutes({
  '/': (params) => console.log(params),
  '/:taskId/edit': (params) => console.log(params)
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
        <TaskOverview onPressPlay={onPressPlay} />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
