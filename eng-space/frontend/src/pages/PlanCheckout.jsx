import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { purchasePlan } from "../api";
import { useAuth } from "../context/AuthContext";

const PLAN_PRICING = {
  plus: {
    name: "EngSpace Plus",
    badge: "Most loved",
    monthly: { price: 290000, durationLabel: "1 tháng", savings: null },
    yearly: { price: 2990000, durationLabel: "12 tháng", savings: "Tiết kiệm 15%" },
  },
  business: {
    name: "EngSpace Business",
    badge: "Đội nhóm",
    monthly: { price: 590000, durationLabel: "1 tháng" },
    yearly: { price: 5990000, durationLabel: "12 tháng", savings: "Tiết kiệm 20%" },
  },
  enterprise: {
    name: "EngSpace Enterprise",
    badge: "Toàn bộ thư viện",
    monthly: { price: 1250000, durationLabel: "1 tháng" },
    yearly: { price: 12990000, durationLabel: "12 tháng", savings: "Ưu đãi 25%" },
  },
};

const PAYMENT_METHODS = [
  { id: "credit", label: "Thẻ tín dụng / ghi nợ", icon: "bi bi-credit-card" },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: "bi bi-bank" },
  { id: "wallet", label: "Ví điện tử", icon: "bi bi-phone" },
];

export default function PlanCheckout() {
  const { plan: planParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    company: "",
    paymentMethod: PAYMENT_METHODS[0].id,
    notes: "",
  });

  const planKey = planParam || "plus";
  const billingCycle = searchParams.get("cycle") === "yearly" ? "yearly" : "monthly";
  const plan = PLAN_PRICING[planKey];

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

  const formattedPrice = useMemo(() => {
    if (!plan) return { raw: 0, label: "0 đ" };
    const value = plan[billingCycle]?.price || 0;
    return {
      raw: value,
      label: value.toLocaleString("vi-VN") + " đ",
    };
  }, [plan, billingCycle]);

  if (!user) {
    return <Navigate to="/enroll" replace />;
  }

  if (!plan) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <p>Không tìm thấy gói học bạn chọn.</p>
            <Link className="btn btn-primary mt-3" to="/pricing">
              Quay lại bảng giá
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setProcessing(true);
    try {
      await purchasePlan({
        plan: planKey,
        billingCycle,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });
      await refreshProfile();
      setStatus({
        type: "success",
        message: "Thanh toán thành công! Gói học đã được kích hoạt cho tài khoản của bạn.",
      });
      setTimeout(() => {
        navigate("/account?tab=profile");
      }, 1400);
    } catch (error) {
      const message = error.response?.data?.message || "Không thể thanh toán gói học. Vui lòng thử lại.";
      setStatus({ type: "error", message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="main checkout-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Thanh toán gói {plan.name}</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li className="current">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
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
                      <label className="form-label">Công ty (tuỳ chọn)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Tên tổ chức / nhóm"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label">Phương thức thanh toán</label>
                      <div className="row g-3">
                        {PAYMENT_METHODS.map((method) => (
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

                    <div className="mb-4">
                      <label className="form-label">Ghi chú cho đội hỗ trợ</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Ví dụ: xuất hoá đơn VAT, cần hỗ trợ kích hoạt sớm..."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                      {processing ? "Đang xử lý..." : `Thanh toán gói ${plan.name}`}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h3 className="h5 mb-4">Tóm tắt gói học</h3>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="badge bg-primary-soft text-uppercase fw-semibold">{plan.badge}</div>
                    <span className="fw-semibold">{plan.name}</span>
                  </div>
                  <p className="text-muted mb-2">Chu kỳ: {plan[billingCycle].durationLabel}</p>
                  <div className="display-6 fw-bold">{formattedPrice.label}</div>
                  {plan[billingCycle].savings && (
                    <p className="text-success fw-semibold">{plan[billingCycle].savings}</p>
                  )}
                  <hr />
                  <ul className="list-unstyled text-muted small mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle me-2 text-success"></i>
                      Truy cập tất cả khóa học thuộc gói #{planKey.toUpperCase()}
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle me-2 text-success"></i>
                      Kết quả học tập được đồng bộ giữa web và mobile
                    </li>
                    <li>
                      <i className="bi bi-check-circle me-2 text-success"></i>
                      Gia hạn tự động khi đến hạn (có thể huỷ bất cứ lúc nào)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card shadow-sm mt-4">
                <div className="card-body">
                  <h4 className="h6 mb-3">Câu hỏi thường gặp</h4>
                  <p className="text-muted small mb-2">Bạn sẽ nhận email hoá đơn và hướng dẫn ngay sau khi thanh toán thành công.</p>
                  <p className="text-muted small mb-0">Cần hỗ trợ? Liên hệ hỗ trợ@engspace.vn hoặc chat trực tiếp 24/7.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

