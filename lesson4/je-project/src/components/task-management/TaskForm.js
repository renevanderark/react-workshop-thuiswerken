import React from "react";
import InputField from "../form-util/InputField";

class TaskForm extends React.Component {

  onTaskNameChange(newValue) {
    this.props.onTaskUnderEditChange({
      contactEmail: this.props.taskUnderEdit.contactEmail.value,
      taskName: newValue
    });
  }

  onContactEmailChange(newValue) {
    this.props.onTaskUnderEditChange({
      contactEmail: newValue,
      taskName: this.props.taskUnderEdit.taskName.value,
    });
  }

  render() {
    const { saving, taskUnderEdit: { taskName, contactEmail } } = this.props;

    const allowedToSave = taskName.isValid && contactEmail.isValid;
  
    return saving
    ? (
      <div>Bezig met opslaan...</div>
    )
    : (
      <div>
        <InputField label="Taaknaam"
                    onChange={(ev) => this.onTaskNameChange(ev.target.value)}
                    field={taskName} />
        <InputField label="Contact email"
                    onChange={(ev) => this.onContactEmailChange(ev.target.value)}
                    field={contactEmail} />
        <button onClick={this.props.onSaveTaskUnderEdit}
          disabled={!allowedToSave} className="btn btn-default">
          Ok
        </button>
      </div>
    );
  }
}

export default TaskForm;
