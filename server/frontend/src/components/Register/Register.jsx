import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const response = await fetch("/djangoapp/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Registration failed.");
      navigate("/login", { state: { message: "Your account is ready. Sign in to continue." } });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return <div className="page-shell"><Header /><main className="register-page">
    <div className="register-card"><p className="eyebrow">Join our community</p><h1>Create your account</h1><p className="form-intro">Sign in to leave dealership reviews and help other drivers.</p>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form onSubmit={submit} className="register-form">
        <label htmlFor="username">Username<input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={update} required /></label>
        <div className="name-fields"><label htmlFor="firstName">First Name<input id="firstName" name="firstName" type="text" autoComplete="given-name" value={form.firstName} onChange={update} required /></label><label htmlFor="lastName">Last Name<input id="lastName" name="lastName" type="text" autoComplete="family-name" value={form.lastName} onChange={update} required /></label></div>
        <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label>
        <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={update} required /></label>
        <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>{saving ? "Creating account…" : "Register"}</button>
      </form><p className="register-login">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  </main></div>;
}
