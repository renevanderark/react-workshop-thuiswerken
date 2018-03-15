import React from "react";
import InputField from "../form-util/InputField";

const TaskForm = () => (
  <div>
    <InputField label="Taaknaam" />
    <InputField label="Contact email" type="email" />
    <button className="btn btn-default">Ok</button>
  </div>
);

export default TaskForm;
