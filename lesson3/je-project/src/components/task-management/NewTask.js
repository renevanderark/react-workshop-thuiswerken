import React from "react";
import {connect} from "react-redux";
import TaskForm from "./TaskForm";

const NewTask = (props) => (
  <div className="card">
    <div className="card-header">Nieuwe taak aanmaken</div>
    <div className="card-body">
      <TaskForm onTaskUnderEditChange={props.onTaskUnderEditChange}
                onSaveTaskUnderEdit={props.onSaveTaskUnderEdit}
                taskUnderEdit={props.taskUnderEdit}
                saving={props.saving} />
    </div>
  </div>
);

export default connect((state) => state.taskManagement)(NewTask);
