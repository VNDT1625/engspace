// Enroll.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { login as loginRequest, register as registerRequest } from "../api";
import { useAuth } from "../context/AuthContext";

const Enroll = () => {
  const navigate = useNavigate();
  const { login: storeAuthSession, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accept: false,
  });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [authLoading, setAuthLoading] = useState({ login: false, signup: false });

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (setter) => (event) => {
    const { name, value, type, checked } = event.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRedirect = (role) => {
    navigate(role === "admin" ? "/admin/dashboard" : "/", { replace: true });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: "" });
    setAuthLoading((prev) => ({ ...prev, login: true }));

    try {
      const { data } = await loginRequest({
        email: loginData.email,
        password: loginData.password,
      });

      storeAuthSession(data, loginData.remember);
      setStatus({
        type: "success",
        message: "Đăng nhập thành công! Đang chuyển hướng...",
      });
      handleRedirect(data.user.role);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể đăng nhập. Vui lòng thử lại.";
      setStatus({ type: "error", message });
    } finally {
      setAuthLoading((prev) => ({ ...prev, login: false }));
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setStatus({
        type: "error",
        message: "Mật khẩu xác nhận không trùng khớp.",
      });
      return;
    }
    if (!signupData.accept) {
      setStatus({
        type: "error",
        message: "Vui lòng đồng ý với điều khoản trước khi đăng ký.",
      });
      return;
    }

    setStatus({ type: null, message: "" });
    setAuthLoading((prev) => ({ ...prev, signup: true }));

    try {
      const { data } = await registerRequest({
        name: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
      });

      storeAuthSession(data, true);
      setStatus({
        type: "success",
        message: "Đăng ký thành công! Đang chuyển hướng...",
      });
      handleRedirect(data.user.role);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể đăng ký. Vui lòng thử lại.";
      setStatus({ type: "error", message });
    } finally {
      setAuthLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  return (
    <>
      {/* Main Content */}
      <main className="main">
        {/* Page Title */}
        <div className="page-title light-background">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">Tài khoản người dùng</h1>
            <nav className="breadcrumbs">
              <ol>
                <li><Link to="/">Home</Link></li>
                <li className="current">Đăng ký · Đăng nhập</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Auth Section */}
        <section id="auth" className="enroll section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row">
              <div className="col-lg-7">
                <div className="enrollment-form-wrapper">
                  <div className="enrollment-header mb-4" data-aos="fade-up" data-aos-delay="200">
                    <p className="text-uppercase text-muted fw-semibold mb-2">Chào mừng trở lại</p>
                    <h2 className="mb-3">Đăng nhập hoặc tạo tài khoản mới</h2>
                    <p>
                      Sử dụng một tài khoản duy nhất để theo dõi khóa học, tiến độ học tập và lịch sử thanh
                      toán.
                    </p>
                  </div>

                  <div className="auth-toggle mb-4 d-flex gap-3">
                    <button
                      type="button"
                      className={`btn ${mode === "login" ? "btn-primary" : "btn-outline-primary"} flex-grow-1`}
                      onClick={() => setMode("login")}
                    >
                      Tôi đã có tài khoản
                    </button>
                    <button
                      type="button"
                      className={`btn ${mode === "signup" ? "btn-primary" : "btn-outline-primary"} flex-grow-1`}
                      onClick={() => setMode("signup")}
                    >
                      Tôi muốn đăng ký
                    </button>
                  </div>

                  {status.message && (
                    <div
                      className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"} mb-4`}
                      role="alert"
                    >
                      {status.message}
                    </div>
                  )}

                  {mode === "login" ? (
                    <form className="enrollment-form" data-aos="fade-up" data-aos-delay="300" onSubmit={handleLoginSubmit}>
                      <div className="mb-4">
                        <label htmlFor="loginEmail" className="form-label">Email *</label>
                        <input
                          type="email"
                          id="loginEmail"
                          name="email"
                          className="form-control"
                          required
                          autoComplete="email"
                          value={loginData.email}
                          onChange={handleChange(setLoginData)}
                        />
                      </div>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <label htmlFor="loginPassword" className="form-label mb-0">Mật khẩu *</label>
                          <Link to="#" className="small text-primary">Quên mật khẩu?</Link>
                        </div>
                        <input
                          type="password"
                          id="loginPassword"
                          name="password"
                          className="form-control"
                          required
                          autoComplete="current-password"
                          value={loginData.password}
                          onChange={handleChange(setLoginData)}
                        />
                      </div>
                      <div className="mb-4 form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={loginData.remember}
                          onChange={handleChange(setLoginData)}
                        />
                        <label className="form-check-label" htmlFor="remember">Ghi nhớ đăng nhập</label>
                      </div>
                      <button type="submit" className="btn btn-enroll w-100 mb-3" disabled={authLoading.login} aria-busy={authLoading.login}>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        {authLoading.login ? "Đang xử lý..." : "Đăng nhập"}
                      </button>
                      <div className="text-center text-muted my-3">
                        <span>Hoặc tiếp tục với</span>
                      </div>
                      <div className="d-flex gap-3">
                        <button type="button" className="btn btn-outline-secondary flex-grow-1">
                          <i className="bi bi-google me-2"></i>
                          Google
                        </button>
                        <button type="button" className="btn btn-outline-secondary flex-grow-1">
                          <i className="bi bi-facebook me-2"></i>
                          Facebook
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form className="enrollment-form" data-aos="fade-up" data-aos-delay="300" onSubmit={handleSignupSubmit}>
                      <div className="mb-4">
                        <label htmlFor="signupName" className="form-label">Họ và tên *</label>
                        <input
                          type="text"
                          id="signupName"
                          name="fullName"
                          className="form-control"
                          required
                          autoComplete="name"
                          value={signupData.fullName}
                          onChange={handleChange(setSignupData)}
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="signupEmail" className="form-label">Email *</label>
                        <input
                          type="email"
                          id="signupEmail"
                          name="email"
                          className="form-control"
                          required
                          autoComplete="email"
                          value={signupData.email}
                          onChange={handleChange(setSignupData)}
                        />
                      </div>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label htmlFor="signupPassword" className="form-label">Mật khẩu *</label>
                          <input
                            type="password"
                            id="signupPassword"
                            name="password"
                            className="form-control"
                            required
                            autoComplete="new-password"
                            value={signupData.password}
                            onChange={handleChange(setSignupData)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="signupConfirm" className="form-label">Nhập lại mật khẩu *</label>
                          <input
                            type="password"
                            id="signupConfirm"
                            name="confirmPassword"
                            className="form-control"
                            required
                            autoComplete="new-password"
                            value={signupData.confirmPassword}
                            onChange={handleChange(setSignupData)}
                          />
                        </div>
                      </div>
                      <div className="mb-4 form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="accept"
                          name="accept"
                          checked={signupData.accept}
                          onChange={handleChange(setSignupData)}
                        />
                        <label className="form-check-label" htmlFor="accept">
                          Tôi đồng ý với <Link to="#">Điều khoản</Link> & <Link to="#">Chính sách</Link>.
                        </label>
                      </div>
                      <button type="submit" className="btn btn-enroll w-100 mb-3" disabled={authLoading.signup} aria-busy={authLoading.signup}>
                        <i className="bi bi-person-plus me-2"></i>
                        {authLoading.signup ? "Đang xử lý..." : "Tạo tài khoản"}
                      </button>
                      <p className="text-center text-muted mb-0">
                        Đã có tài khoản?{" "}
                        <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setMode("login")}>
                          Đăng nhập ngay
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              </div>

              {/* Benefits Column */}
              <div className="col-lg-5 mt-5 mt-lg-0">
                <div className="enrollment-benefits" data-aos="fade-left" data-aos-delay="400">
                  <h3>Tại sao nên tạo tài khoản?</h3>
                  <div className="benefit-item">
                    <div className="benefit-icon"><i className="bi bi-journal-check"></i></div>
                    <div className="benefit-content">
                      <h4>Quản lý học tập</h4>
                      <p>Theo dõi tiến độ học, tài liệu đã học và các bài tập cần hoàn thành trong một bảng điều khiển duy nhất.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon"><i className="bi bi-bell"></i></div>
                    <div className="benefit-content">
                      <h4>Nhắc nhở tức thời</h4>
                      <p>Nhận thông báo về buổi học trực tiếp, hạn chót và cập nhật khóa học mới nhất.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon"><i className="bi bi-shield-lock"></i></div>
                    <div className="benefit-content">
                      <h4>Bảo mật dữ liệu</h4>
                      <p>Mọi thông tin cá nhân được mã hóa và chỉ dùng cho mục đích học tập.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon"><i className="bi bi-people"></i></div>
                    <div className="benefit-content">
                      <h4>Cộng đồng học viên</h4>
                      <p>Kết nối với mentors và học viên khác để thảo luận, đặt câu hỏi và nhận hỗ trợ.</p>
                    </div>
                  </div>
                  <div className="enrollment-stats mt-4">
                    <div className="stat-item">
                      <span className="stat-number">120K+</span>
                      <span className="stat-label">Tài khoản đang hoạt động</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">98%</span>
                      <span className="stat-label">Học viên hài lòng</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">4.9/5</span>
                      <span className="stat-label">Đánh giá trung bình</span>
                    </div>
                    <p className="mt-4 small text-muted">
                      Bạn chưa có API đăng nhập? Hãy kết nối form này với backend (Firebase, Supabase, v.v.) hoặc gọi REST API /auth khi sẵn sàng.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

    </>
  );
};

export default Enroll;
