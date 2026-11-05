import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import "./Login.css";
import Header from '../Header/Header';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const login_url = "/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();

    try {
    const res = await fetch(login_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password
        }),
    });

    const json = await res.json();
    if (json.status === "Authenticated") {
      sessionStorage.setItem('username', json.userName);
      navigate("/");
    } else {
      setError(json.error || "The user could not be authenticated.");
    }
    } catch (err) {
      setError("Could not reach the sign-in service. Please try again.");
    }
};

  return (
    <div>
      <Header/>
      <main className="login-page">
          <form className="login_panel" onSubmit={login}>
              <p className="eyebrow">Welcome back</p><h1>Log in</h1>
              {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              <div>
              <span className="input_field">Username </span>
              <input type="text"  name="username" placeholder="Username" className="input_field" autoComplete="username" required onChange={(e) => setUserName(e.target.value)}/>
              </div>
              <div>
              <span className="input_field">Password </span>
              <input name="psw" type="password"  placeholder="Password" className="input_field" autoComplete="current-password" required onChange={(e) => setPassword(e.target.value)}/>
              </div>
              <div>
              <input className="action_button" type="submit" value="Login"/>
              <button className="action_button" type="button" onClick={() => navigate("/")}>Cancel</button>
              </div>
              <p>New here? <Link className="loginlink" to="/register">Create an account</Link></p>
          </form>
      </main>
    </div>
  );
};

export default Login;
