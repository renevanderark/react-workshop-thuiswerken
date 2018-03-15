import React from "react";
import ValidBox from "./ValidBox";

class InputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isValid: false,
      value: ""
    };
  }

  onValueChange(ev) {
    const { type } = this.props;
    const newValue = ev.target.value;
    this.setState({
      value: newValue,
      isValid: type === "email"
        ? !!newValue.match(/.+\@.+\..+/) // lelijke email validatie
        : newValue.length > 2 // default validatie (type is undefined)
    });
  }


  render() {
    const { isValid, value } = this.state;
    const { label } = this.props;
    return (
      <div className="form-row row">
        <label className="col-md-2">{label}</label>
        <div className="input-group col-md-10">
          <ValidBox isValid={isValid} />
          <input onChange={this.onValueChange.bind(this)} type="text" className="form-control" value={value} />
        </div>
      </div>
    );
  }
}
export default InputField;
