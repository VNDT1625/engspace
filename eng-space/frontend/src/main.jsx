import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

// GLOBAL
import "./assets/css/main.css";

// VENDOR CSS
import "./assets/vendor/bootstrap/css/bootstrap.min.css";
import "./assets/vendor/bootstrap-icons/bootstrap-icons.css";
import "./assets/vendor/aos/aos.css";
import "./assets/vendor/swiper/swiper-bundle.min.css";

// VENDOR JS

import "bootstrap/dist/js/bootstrap.bundle.min.js";


// AOS (bản module chuẩn)
import AOS from "aos";
import "aos/dist/aos.css";

// KHỞI TẠO AOS
AOS.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
