import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";

import StarRating from "./StarRating";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StarRating defaultRating={4} />
    <StarRating size={62} color="black" messages={["Terrible", "Bad", "Okey", "Good", "Amazing"]} />
  </React.StrictMode>
);
