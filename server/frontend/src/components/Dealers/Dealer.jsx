import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positiveIcon from "../assets/positive.png";
import neutralIcon from "../assets/neutral.png";
import negativeIcon from "../assets/negative.png";
import Header from "../Header/Header";

const sentimentIcon = { positive: positiveIcon, neutral: neutralIcon, negative: negativeIcon };

export default function Dealer() {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const loggedIn = Boolean(sessionStorage.getItem("username"));

  useEffect(() => {
    const load = async () => {
      try {
        const [dealerResponse, reviewsResponse] = await Promise.all([
          fetch(`/djangoapp/dealer/${id}`), fetch(`/djangoapp/reviews/dealer/${id}`),
        ]);
        const dealerBody = await dealerResponse.json();
        const reviewsBody = await reviewsResponse.json();
        if (!dealerResponse.ok) throw new Error(dealerBody.error || "Dealership not found.");
        if (!reviewsResponse.ok) throw new Error(reviewsBody.error || "Could not load reviews.");
        setDealer((dealerBody.dealer || [])[0] || null);
        setReviews(reviewsBody.reviews || []);
      } catch (err) { setError(err.message); }
    };
    load();
  }, [id]);

  return <div className="page-shell"><Header /><main className="container dealer-detail">
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {dealer && <><Link className="back-link" to="/dealers">← All dealerships</Link><div className="detail-heading"><div><p className="eyebrow">Dealer #{dealer.id}</p><h1>{dealer.full_name}</h1><p>{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p></div>{loggedIn && <Link className="btn btn-primary" to={`/postreview/${dealer.id}`}>Write a review</Link>}</div>
      <section className="reviews-section"><div className="section-heading"><h2>Driver reviews</h2><span>{reviews.length} review{reviews.length === 1 ? "" : "s"}</span></div>
      {reviews.length === 0 ? <p className="empty-state">No reviews yet. Be the first to share your experience.</p> : <div className="review-grid">{reviews.map((review, index) => <article className="review-card" key={review.id || index}><div className="review-card-top"><img src={sentimentIcon[review.sentiment] || neutralIcon} className="emotion_icon" alt={`${review.sentiment || "neutral"} sentiment`} /><span className={`sentiment sentiment-${review.sentiment || "neutral"}`}>{review.sentiment || "neutral"}</span></div><p className="review-text">“{review.review}”</p><p className="reviewer">{review.name} · {review.car_year} {review.car_make} {review.car_model}</p></article>)}</div>}</section>
    </>}
  </main></div>;
}
