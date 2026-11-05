import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import reviewIcon from "../assets/reviewicon.png";

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [error, setError] = useState("");
  const loggedIn = Boolean(sessionStorage.getItem("username"));

  useEffect(() => {
    const loadDealers = async () => {
      try {
        const response = await fetch("/djangoapp/get_dealers");
        const body = await response.json();
        if (!response.ok || body.status !== 200) throw new Error(body.error || "Could not load dealerships.");
        setDealers(body.dealers || []);
        setStates([...new Set((body.dealers || []).map((dealer) => dealer.state).filter(Boolean))].sort());
      } catch (err) {
        setError(err.message);
      }
    };
    loadDealers();
  }, []);

  const filter = async (state) => {
    setSelectedState(state);
    try {
      const path = state === "All" ? "/djangoapp/get_dealers" : `/djangoapp/get_dealers/${encodeURIComponent(state)}`;
      const response = await fetch(path);
      const body = await response.json();
      if (!response.ok || body.status !== 200) throw new Error(body.error || "Could not filter dealerships.");
      setDealers(body.dealers || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-shell">
      <Header />
      <main className="container dealer-page">
        <div className="page-heading">
          <div><p className="eyebrow">Find your next stop</p><h1>Dealership directory</h1><p>Browse verified dealerships and read feedback from local drivers.</p></div>
          <label className="state-filter">Filter by state <select aria-label="Filter dealers by state" value={selectedState} onChange={(event) => filter(event.target.value)}><option value="All">All states</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <p className="results-count" aria-live="polite">{dealers.length} dealership{dealers.length === 1 ? "" : "s"}{selectedState !== "All" ? ` in ${selectedState}` : ""}</p>
        <div className="table-responsive"><table className="table table-hover dealer-table">
          <thead><tr><th scope="col">ID</th><th scope="col">Dealership</th><th scope="col">City</th><th scope="col">Address</th><th scope="col">ZIP</th><th scope="col">State</th>{loggedIn && <th scope="col">Review</th>}</tr></thead>
          <tbody>{dealers.map((dealer) => <tr key={dealer.id}><td>{dealer.id}</td><td><Link className="dealer-link" to={`/dealer/${dealer.id}`}>{dealer.full_name}</Link></td><td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.zip}</td><td>{dealer.state}</td>{loggedIn && <td><Link to={`/postreview/${dealer.id}`} aria-label={`Review ${dealer.full_name}`}><img src={reviewIcon} className="review_icon" alt="Review dealer" /></Link></td>}</tr>)}</tbody>
        </table></div>
      </main>
    </div>
  );
}
