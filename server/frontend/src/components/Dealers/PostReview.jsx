import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

export default function PostReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [cars, setCars] = useState([]);
  const [review, setReview] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [car, setCar] = useState("");
  const [carYear, setCarYear] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch(`/djangoapp/dealer/${id}`).then((response) => response.json()), fetch("/djangoapp/get_cars").then((response) => response.json())])
      .then(([dealerBody, carsBody]) => { setDealer((dealerBody.dealer || [])[0] || null); setCars(carsBody.CarModels || []); })
      .catch(() => setError("Could not load the dealer or car list."));
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    const [carMake, ...modelParts] = car.split("|");
    const carModel = modelParts.join("|");
    if (!review.trim() || !purchaseDate || !carMake || !carModel || !carYear) { setError("Complete every field before posting your review."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/djangoapp/add_review", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dealership: id, review: review.trim(), purchase: true, purchase_date: purchaseDate, car_make: carMake, car_model: carModel, car_year: carYear }) });
      const body = await response.json();
      if (!response.ok || body.status !== 200) throw new Error(body.error || "The review could not be posted.");
      navigate(`/dealer/${id}`);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return <div className="page-shell"><Header /><main className="container review-form-page">
    <Link className="back-link" to={`/dealer/${id}`}>← Back to dealership</Link>
    <h1>Share your experience</h1><p className="form-intro">{dealer ? `Your review for ${dealer.full_name}` : "Tell other drivers about your visit."}</p>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <form className="review-form" onSubmit={submit}>
      <label htmlFor="review">Your review<textarea id="review" value={review} onChange={(event) => setReview(event.target.value)} rows="6" maxLength="2000" required placeholder="What stood out about your experience?" /></label>
      <label htmlFor="purchase-date">Purchase date<input id="purchase-date" type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} required /></label>
      <label htmlFor="car-model">Car make and model<select id="car-model" value={car} onChange={(event) => setCar(event.target.value)} required><option value="">Choose your car</option>{cars.map((item, index) => <option key={`${item.CarMake}-${item.CarModel}-${index}`} value={`${item.CarMake}|${item.CarModel}`}>{item.CarMake} {item.CarModel}</option>)}</select></label>
      <label htmlFor="car-year">Car year<select id="car-year" value={carYear} onChange={(event) => setCarYear(event.target.value)} required><option value="">Choose year</option>{Array.from({ length: 9 }, (_, index) => 2023 - index).map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>{saving ? "Posting…" : "Post review"}</button>
    </form>
  </main></div>;
}
