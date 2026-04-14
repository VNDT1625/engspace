import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goToAccount = (tab) => {
    navigate(`/account?tab=${tab}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid container-xl position-relative d-flex align-items-center">
        <Link to="/" className="logo d-flex align-items-center me-auto">
          <h1 className="sitename">EngSpace</h1>
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><NavLink to="/" end>Trang chủ</NavLink></li>
            <li><NavLink to="/about">Về Chúng Tôi</NavLink></li>
            <li><NavLink to="/courses">Khóa Học</NavLink></li>
            <li><NavLink to="/pricing">Học Phí</NavLink></li>
            <li><NavLink to="/blog">Bài Viết</NavLink></li>
            <li><NavLink to="/quiz">Quiz</NavLink></li>
            <li><NavLink to="/readinglist">Reading List</NavLink></li>
            <li><NavLink to="/ai-tutor" className="text-primary fw-bold"><i className="bi bi-robot me-1"></i>AI Tutor</NavLink></li>

            {/* Dropdown giữ nguyên <a> vì nó không phải route */}
            <li className="dropdown">
              <a href="#"><span>Chính sách & Điều khoản</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
              <ul>
                <li><NavLink to="/terms">Điều khoản</NavLink></li>
                <li><NavLink to="/privacy">Chính sách</NavLink></li>
              </ul>
            </li>

            <li><NavLink to="/contact">Liên hệ</NavLink></li>
          </ul>

          <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>

        {!user ? (
          <NavLink className="btn-getstarted" to="/enroll">Đăng nhập</NavLink>
        ) : (
          <div className="dropdown ms-3">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2 dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle"></i>
              <span className="d-none d-md-inline">{user.name}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg">
              <li>
                <button className="dropdown-item" onClick={() => goToAccount("profile")}>
                  <i className="bi bi-person-lines-fill me-2"></i>
                  Thông tin cá nhân
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => goToAccount("courses")}>
                  <i className="bi bi-journal-text me-2"></i>
                  Khóa học đã mua
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => goToAccount("quizzes")}>
                  <i className="bi bi-clipboard-check me-2"></i>
                  Quiz đã làm
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => goToAccount("readings")}>
                  <i className="bi bi-book-half me-2"></i>
                  Reading đã nộp
                </button>
              </li>
              {user.role === 'admin' && (
                <>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink className="dropdown-item" to="/admin/dashboard">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Admin Dashboard
                    </NavLink>
                  </li>
                </>
              )}
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
