import React from "react";
import {connect} from "react-redux";
import TaskForm from "./TaskForm";

const EditTask = (props) => props.showEdit ? (
  <div className="card">
    <div className="card-header">Taak bewerken</div>
    <div className="card-body">
      <TaskForm onTaskUnderEditChange={props.onTaskUnderEditChange}
                onSaveTaskUnderEdit={props.onSaveTaskUnderEdit}
                taskUnderEdit={props.taskUnderEdit}
                saving={props.saving} />
    </div>
  </div>
) : null;

export default connect((state) => state.taskManagement)(EditTask);
