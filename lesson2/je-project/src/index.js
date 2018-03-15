import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App";
import Header from "./components/layout/Header";
import NewTask from "./components/task-management/NewTask";
import TaskOverview from "./components/task-overview/TaskOverview";

window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render(
    <App>
      <Header versie="0.0.1">Takenbeheer</Header>
      <NewTask />
      <TaskOverview />
    </App>,

  document.getElementById("app"))
);
