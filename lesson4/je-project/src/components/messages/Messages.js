import React from "react";
import { connect } from "react-redux";

const Messages = (props) => (
  <div>
    {props.messages.map((message, idx) => (
      <div key={idx} className={`alert alert-${message.level}`}>
        {message.text}
        <button onClick={() => props.onRemoveMessage(idx)} className="close">
          <span>&times;</span>
        </button>
      </div>
    ))}
  </div>
);

export default connect(state => state.messages)(Messages)
