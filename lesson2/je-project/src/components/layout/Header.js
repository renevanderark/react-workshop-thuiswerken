import React from "react";

const Header = (props) => (
  <div className="navbar">
    <div className="navbar-header">
      <div className="navbar-brand">{props.children}</div>
    </div>
    <span className="navbar-right" style={{color: "#aaa"}}>versie {props.versie}</span>
  </div>
);

export default Header;
