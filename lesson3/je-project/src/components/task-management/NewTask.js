import React from "react";

import TaskForm from "./TaskForm";

const NewTask = () => (
  <div className="card">
    <div className="card-header">Nieuwe taak aanmaken</div>
    <div className="card-body">
      <TaskForm />
    </div>
  </div>
);

export default NewTask;
