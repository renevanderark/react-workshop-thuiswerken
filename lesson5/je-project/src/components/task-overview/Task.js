import React from "react";


// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript#answer-10073788
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const dateFmt = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}T` +
  `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}.` +
  `${pad(date.getMilliseconds(), 3)}Z`;

const Task = ({ id, taskName, contactEmail, timeStamp, status, onPressPlay, navigateTo }) => (
  <tr>
    <td><button disabled={status !== 'wachtrij'} className="btn btn-sm" onClick={onPressPlay}>►</button></td>
    <td>
      <a style={{color: "blue", cursor: "pointer"}} onClick={() => navigateTo(`/${id}/edit`)}>{taskName}</a>
    </td>
    <td>{status}</td>
    <td>{contactEmail}</td>
    <td>{dateFmt(new Date(timeStamp))}</td>
  </tr>
);

export default Task;
