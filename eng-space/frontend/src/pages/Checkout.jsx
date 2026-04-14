import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { getCourseById, getCourseDetails, purchaseCourse, getImageUrl } from "../api";
import { useAuth } from "../context/AuthContext";

const defaultPaymentMethods = [
  { id: "credit", label: "Thẻ tín dụng / Ghi nợ", icon: "bi bi-credit-card-2-front" },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: "bi bi-bank" },
  { id: "wallet", label: "Ví điện tử", icon: "bi bi-phone" },
];

export default function Checkout() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationState = location.state || {};
  const preloadedCourse = locationState.course || null;
  const fallbackCourseId = locationState.courseId || preloadedCourse?._id || searchParams.get("courseId");
  const fallbackCourseSlug = locationState.courseSlug || preloadedCourse?.slug || null;
  const courseSlug = slug || searchParams.get("slug") || fallbackCourseSlug || null;
  const courseId = fallbackCourseId || null;
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(preloadedCourse);
  const [loading, setLoading] = useState(!preloadedCourse);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    paymentMethod: defaultPaymentMethods[0].id,
    cardNumber: "",
    expiry: "",
    cvc: "",
    notes: "",
  });

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  useEffect(() => {
    let ignore = false;

    if (!courseSlug && !courseId) {
      setLoading(false);
      setError("Không tìm thấy thông tin khóa học để thanh toán.");
      return () => {
        ignore = true;
      };
    }

    const slugLooksLikeObjectId = Boolean(courseSlug && /^[0-9a-fA-F]{24}$/.test(courseSlug));

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      const attempts = [];
      if (courseSlug) {
        attempts.push(() => getCourseDetails(courseSlug));
      }
      if (courseId) {
        attempts.push(() => getCourseById(courseId));
      } else if (courseSlug && slugLooksLikeObjectId) {
        attempts.push(() => getCourseById(courseSlug));
      }

      if (!attempts.length) {
        if (!ignore) {
          setCourse(null);
          setError("Không tìm thấy thông tin khóa học để thanh toán.");
          setLoading(false);
        }
        return;
      }

      let lastError = null;

      for (const attempt of attempts) {
        try {
          const res = await attempt();
          if (!ignore) {
            setCourse(res.data);
            setError(null);
          }
          return;
        } catch (err) {
          lastError = err;
        }
      }

      if (!ignore) {
        console.error(lastError);
        setCourse(null);
        setError("Không tải được thông tin khóa học. Vui lòng thử lại.");
      }
    };

    fetchCourse().finally(() => {
      if (!ignore) {
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [courseSlug, courseId]);

  if (authLoading) {
    return (
      <main className="main checkout-page">
        <section className="section">
          <div className="container text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Đang kiểm tra phiên đăng nhập...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/enroll" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!course?._id) return;
    setProcessing(true);
    setStatus(null);
    try {
      await purchaseCourse({
        courseId: course._id,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });
      setStatus({
        type: "success",
        message: "Thanh toán thành công! Bạn có thể xem khóa học trong mục Khóa học đã mua.",
      });
      setTimeout(() => {
        navigate("/account?tab=courses");
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể xử lý thanh toán. Vui lòng thử lại.";
      setStatus({ type: "error", message });
    } finally {
      setProcessing(false);
    }
  };

  const price = course?.price || 0;
  const formattedPrice = price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} đ`;

  return (
    <main className="main checkout-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Thanh toán khóa học</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li className="current">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Đang tải thông tin khóa học...</p>
            </div>
          ) : !course ? (
            <div className="alert alert-warning">
              <p className="mb-2">{error || "Không tìm thấy khóa học bạn chọn."}</p>
              <Link to="/courses" className="alert-link">
                Quay lại danh sách
              </Link>
              {courseSlug ? null : (
                <p className="mb-0 mt-2">
                  Vui lòng kiểm tra lại đường dẫn hoặc quay lại khoá học để bấm “Mua khoá học” lần nữa.
                </p>
              )}
            </div>
          ) : (
            <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
              <div className="col-lg-7">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h3 className="h5 mb-4">Thông tin thanh toán</h3>
                    {status && (
                      <div className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"}`}>
                        {status.message}
                      </div>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
                        <input
                          type="text"
                          className="form-control"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          placeholder="0901 234 567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Phương thức thanh toán</label>
                        <div className="row g-3">
                          {defaultPaymentMethods.map((method) => (
                            <div className="col-md-4 col-sm-6" key={method.id}>
                              <label className={`payment-option ${formData.paymentMethod === method.id ? "active" : ""}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={method.id}
                                  checked={formData.paymentMethod === method.id}
                                  onChange={handleChange}
                                />
                                <i className={method.icon}></i>
                                <span>{method.label}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {formData.paymentMethod === "credit" && (
                        <div className="row">
                          <div className="col-12 mb-3">
                            <label className="form-label">Số thẻ</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Ngày hết hạn</label>
                            <input
                              type="text"
                              className="form-control"
                              name="expiry"
                              placeholder="MM/YY"
                              value={formData.expiry}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">CVC</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cvc"
                              placeholder="123"
                              value={formData.cvc}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="form-label">Ghi chú (tuỳ chọn)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Thêm lưu ý cho đội ngũ hỗ trợ nếu cần..."
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                        {processing ? "Đang xử lý..." : "Thanh toán & Đăng ký"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h3 className="h5 mb-4">Thông tin đơn hàng</h3>
                    <div className="order-course d-flex gap-3 align-items-center">
                      <img
                        src={getImageUrl(course.image) || "/assets/img/education/courses-8.webp"}
                        alt={course.title}
                        className="rounded"
                        onError={(e) => {
                          e.target.src = "/assets/img/education/courses-8.webp";
                        }}
                        style={{ width: 96, height: 96, objectFit: "cover" }}
                      />
                      <div>
                        <h4 className="h6 mb-1">{course.title}</h4>
                        <p className="text-muted mb-0">{course.category} • {course.level}</p>
                      </div>
                    </div>

                    <hr />
                    <div className="d-flex justify-content-between">
                      <span>Giá khóa học</span>
                      <strong>{formattedPrice}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-2">
                      <span>Phí hỗ trợ</span>
                      <span>0 đ</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted mt-2">
                      <span>VAT</span>
                      <span>Đã bao gồm</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Tổng thanh toán</span>
                      <strong className="fs-5">{formattedPrice}</strong>
                    </div>
                    <p className="text-muted small mt-3 mb-0">
                      Sau khi thanh toán hoàn tất, bạn sẽ nhận được email xác nhận cùng hướng dẫn truy cập khóa học.
                    </p>
                  </div>
                </div>

                <div className="card shadow-sm mt-4">
                  <div className="card-body">
                    <h4 className="h6 mb-3">Cam kết bảo mật</h4>
                    <ul className="list-unstyled text-muted small mb-0">
                      <li className="mb-2">
                        <i className="bi bi-shield-lock me-2 text-primary"></i>
                        Thông tin thanh toán được mã hóa và bảo vệ.
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                        Hoàn tiền trong vòng 7 ngày nếu khóa học không phù hợp.
                      </li>
                      <li>
                        <i className="bi bi-chat-left-dots me-2 text-primary"></i>
                        Hỗ trợ 24/7 qua email và live chat.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

