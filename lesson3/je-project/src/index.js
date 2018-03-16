import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from "redux-thunk";
import { Provider } from "react-redux";

import taskManagementReducer from "./store/task-management";
import taskOverviewReducer from "./store/task-overview";

import actionCreator from "./actions";
import App from "./components/App";
import Header from "./components/layout/Header";
import NewTask from "./components/task-management/NewTask";
import TaskOverview from "./components/task-overview/TaskOverview";

const store = createStore(combineReducers({
  taskManagement: taskManagementReducer,
  taskOverview: taskOverviewReducer
}), applyMiddleware(thunk));

const {
  onTaskUnderEditChange,
  onSaveTaskUnderEdit
} = actionCreator(store.dispatch);

window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.2">Takenbeheer</Header>
        <NewTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <TaskOverview />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
