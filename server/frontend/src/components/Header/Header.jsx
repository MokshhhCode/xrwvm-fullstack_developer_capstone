import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/style.css";
import "../assets/bootstrap.min.css";

export default function Header() {
  const [username, setUsername] = useState(() => sessionStorage.getItem("username"));
  const location = useLocation();
  const djangoOrigin = window.location.port === "3000" ? "http://127.0.0.1:8000" : window.location.origin;

  const logout = async () => {
    try {
      await fetch("/djangoapp/logout", { method: "GET", credentials: "include" });
    } finally {
      sessionStorage.clear();
      setUsername(null);
      window.location.assign("/");
    }
  };

  const active = (path) => location.pathname === path || (path === "/" && location.pathname === "/dealers");
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light dealership-nav">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Dealerships</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className={`nav-link${active("/") ? " active" : ""}`} aria-current={active("/") ? "page" : undefined} to="/">Home</Link></li>
              <li className="nav-item"><a className="nav-link" href={`${djangoOrigin}/about`}>About Us</a></li>
              <li className="nav-item"><a className={`nav-link${location.pathname === "/contact" ? " active" : ""}`} href={`${djangoOrigin}/contact`}>Contact Us</a></li>
            </ul>
            <div className="account-nav">
              {username ? <><span className="username" aria-label="Logged in user">{username}</span><button className="btn btn-outline-dark" onClick={logout}>Logout</button></> : <><Link className="btn btn-outline-dark" to="/login">Login</Link><Link className="btn btn-dark" to="/register">Register</Link></>}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
