import React from "react";
import { connect } from "react-redux";

import Task from "./Task";

class TaskOverview extends React.Component {

  render() {
    const { pending, tasks, onPressPlay } = this.props;

    const tableBody = pending
      ? (<tr><td colSpan="5">Bezig met laden...</td></tr>)
      : tasks
          .sort((a, b) => b.timeStamp - a.timeStamp)
          .map(task => <Task key={task.id} {...task} onPressPlay={() => onPressPlay(task.id)} />);

    return (
      <div className="card">
        <div className="card-header">Takenoverzicht</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Taak starten</th>
                <th>Naam taak</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Aangemaakt</th>
              </tr>
            </thead>
            <tbody>
              {tableBody}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
export default connect((state) => state.taskOverview)(TaskOverview);
