import React from "react";
import ValidBox from "./ValidBox";

const InputField = (props) => {
  const { field: {isValid, value}, label, onChange } = props;
  return (
    <div className="form-row row">
      <label className="col-md-2">{label}</label>
      <div className="input-group col-md-10">
        <ValidBox isValid={isValid} />
        <input onChange={onChange} type="text" className="form-control" value={value} />
      </div>
    </div>
  );
}

export default InputField;
