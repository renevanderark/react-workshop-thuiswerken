import React from "react";
import { connect } from "react-redux";

class TaskOverview extends React.Component {

  render() {
    return (
      <div className="card">
        <div className="card-header">Takenoverzicht</div>
        <div className="card-body">
          <pre>{JSON.stringify(this.props, null, 2)}</pre>
        </div>
      </div>
    );
  }
}
export default connect((state) => state.taskOverview)(TaskOverview);
