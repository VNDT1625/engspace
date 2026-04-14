import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Header />

      {/* FIX: scroll to top khi đổi trang */}
      <ScrollToTop />

      <div className="app-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
