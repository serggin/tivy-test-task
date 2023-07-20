import React from "react";
import logo from "./img/logo.png";
import "./App.css";
import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Link to="/">
          <img className="logo" src={logo} alt="tivy Logo" />
        </Link>
        <h1>tivy test task</h1>
      </header>
      <Outlet />
    </div>
  );
}

export default App;
