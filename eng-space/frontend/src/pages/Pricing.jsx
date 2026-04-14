import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const PLAN_CARDS = [
  {
    id: "plus",
    name: "Plus",
    description: "Truy cập mọi khóa học nâng cao cho cá nhân.",
    monthly: 290000,
    yearly: 2990000,
    perks: [
      "Hơn 50+ khóa học nâng cao",
      "Quiz và chứng chỉ",
      "Tải tài liệu ngoại tuyến",
      "Học trên nhiều thiết bị",
      "Hỗ trợ ưu tiên 24/7",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "Dành cho nhóm 5-25 người, quản trị học viên.",
    monthly: 590000,
    yearly: 5990000,
    featured: true,
    badge: "Most Popular",
    perks: [
      "Tất cả lợi ích của Plus",
      "Dashboard quản lý đội nhóm",
      "Chỉ định mentor nội bộ",
      "Báo cáo tiến độ hàng tuần",
      "Tư vấn triển khai onboarding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Gói tùy biến cho doanh nghiệp lớn & học viện.",
    monthly: 1250000,
    yearly: 12990000,
    perks: [
      "Triển khai nội dung riêng",
      "API & Single Sign-On",
      "Đào tạo trực tiếp theo yêu cầu",
      "Cố vấn chiến lược học tập",
      "Hỗ trợ triển khai tận nơi",
    ],
  },
];

export default function Pricing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState(() =>
    searchParams.get("cycle") === "yearly" ? "yearly" : "monthly"
  );

  useEffect(() => {
    AOS.init();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSearchParams({ cycle: billingCycle });
  }, [billingCycle, setSearchParams]);

  const cycleLabel = billingCycle === "monthly" ? "/tháng" : "/năm";

  const toggleBilling = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"));
  };

  const planCards = useMemo(() => PLAN_CARDS, []);

  return (
    <main className="main pricing-page">

      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Pricing</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Home</a></li>
              <li className="current">Pricing</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="pricing section">

        <div className="container pricing-toggle-container" data-aos="fade-up" data-aos-delay="100">

          {/* Pricing Toggle */}
          <div className="pricing-toggle d-flex align-items-center justify-content-center text-center mb-5">
            <span className={`monthly ${billingCycle === "monthly" ? "active" : ""}`}>Monthly</span>
            <div className="form-check form-switch d-inline-block mx-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="pricingSwitch"
                checked={billingCycle === "yearly"}
                onChange={toggleBilling}
              />
              <label className="form-check-label" htmlFor="pricingSwitch"></label>
            </div>
            <span className={`yearly ${billingCycle === "yearly" ? "active" : ""}`}>
              Yearly <span className="badge">Tiết kiệm 15%</span>
            </span>
          </div>

          {/* Pricing Plans */}
          <div className="row gy-4 justify-content-center">

            {/* BASIC */}
            <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="pricing-item">
                <div className="pricing-header">
                  <h6 className="pricing-category">Basic</h6>
                  <div className="price-wrap">
                    <h2 className="price">Free</h2>
                  </div>
                  <p className="pricing-description">Lorem ipsum dolor sit</p>
                </div>

                <div className="pricing-cta">
                  <a href="#" className="btn btn-primary w-100">Continue</a>
                </div>

                <div className="pricing-features">
                  <h6>Basic Plan Includes:</h6>
                  <ul className="feature-list">
                    <li><i className="bi bi-check"></i> Lorem ipsum dolor sit amet</li>
                    <li><i className="bi bi-check"></i> Consectetur adipiscing elit</li>
                    <li><i className="bi bi-check"></i> Sed do eiusmod tempor</li>
                    <li><i className="bi bi-check"></i> Incididunt ut labore</li>
                    <li><i className="bi bi-check"></i> Et dolore magna aliqua</li>
                    <li><i className="bi bi-check"></i> Ut enim ad minim veniam</li>
                    <li><i className="bi bi-check"></i> Quis nostrud exercitation</li>
                    <li><i className="bi bi-check"></i> Ullamco laboris nisi ut</li>
                    <li><i className="bi bi-check"></i> Aliquip ex ea commodo</li>
                  </ul>
                </div>
              </div>
            </div>

            {planCards.map((plan, index) => {
              const priceValue = billingCycle === "monthly" ? plan.monthly : plan.yearly;
              const priceText = typeof priceValue === "number" ? priceValue.toLocaleString("vi-VN") : null;
              return (
                <div
                  className="col-lg-3 col-md-6"
                  data-aos="fade-up"
                  data-aos-delay={200 + index * 100}
                  key={plan.id}
                >
                  <div className={`pricing-item ${plan.featured ? "popular" : ""}`}>
                    {plan.badge && <div className="popular-badge">{plan.badge}</div>}
                    <div className="pricing-header">
                      <h6 className="pricing-category">{plan.name}</h6>
                      <div className="price-wrap">
                        <div className="price">
                          {priceText ? (
                            <>
                              <sup>đ</sup>
                              {priceText}
                              <span>{cycleLabel}</span>
                            </>
                          ) : (
                            <span>Liên hệ</span>
                          )}
                        </div>
                      </div>
                      <p className="pricing-description">{plan.description}</p>
                    </div>

                    <div className="pricing-cta">
                      <Link
                        className="btn btn-primary w-100"
                        to={`/pricing/checkout/${plan.id}?cycle=${billingCycle}`}
                      >
                        {plan.id === "enterprise" ? "Contact Sales" : "Thanh toán"}
                      </Link>
                    </div>

                    <div className="pricing-features">
                      <h6>Lợi ích nổi bật</h6>
                      <ul className="feature-list">
                        {plan.perks.map((perk) => (
                          <li key={perk}>
                            <i className="bi bi-check"></i> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
}
