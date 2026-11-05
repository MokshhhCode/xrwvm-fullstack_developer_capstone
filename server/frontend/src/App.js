import { Route, Routes } from "react-router-dom";
import Dealer from "./components/Dealers/Dealer";
import Dealers from "./components/Dealers/Dealers";
import PostReview from "./components/Dealers/PostReview";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dealers />} />
      <Route path="/dealers" element={<Dealers />} />
      <Route path="/dealer/:id" element={<Dealer />} />
      <Route path="/postreview/:id" element={<PostReview />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Dealers />} />
    </Routes>
  );
}
