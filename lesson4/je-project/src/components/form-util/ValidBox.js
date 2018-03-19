import React from "react";

const ValidBox = (props) => (
  <div className="input-group-prepend">
    <div className="input-group-text">{props.isValid ? "✔" : "✘"}</div>
  </div>
);

export default ValidBox;
