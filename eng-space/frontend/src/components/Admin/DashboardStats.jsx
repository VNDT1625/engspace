import React from "react";
import Sparkline from "../Common/Sparkline";

// Helper format tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const PLACEHOLDER_REVENUE_SERIES = [320, 410, 380, 450, 520, 610, 680];
const TOP_PLANS = [
  { label: "Plus", value: 48 },
  { label: "Business", value: 32 },
  { label: "Enterprise", value: 20 },
];
const SAMPLE_CONTACTS = [
  { name: "Minh Anh", subject: "Cần tư vấn gói Business", status: "Mới" },
  { name: "Thanh Tùng", subject: "Hỗ trợ truy cập khóa học", status: "Đang xử lý" },
  { name: "Lan Hương", subject: "Đề xuất nội dung mới", status: "Đã phản hồi" },
];
const QUICK_ACTIONS = [
  { title: "Tạo khóa học", icon: "bi-plus-lg", accent: "accent-1" },
  { title: "Tạo quiz", icon: "bi-lightning-charge", accent: "accent-2" },
  { title: "Bài blog mới", icon: "bi-pencil-square", accent: "accent-3" },
  { title: "Xuất báo cáo", icon: "bi-filetype-pdf", accent: "accent-4" },
];

export default function DashboardStats({ summary, loading, onExport }) {
  const revenueTotal = summary.revenue?.total || 0;
  const revenueTimeline = summary.revenue?.timeline || [];
  let chartPoints =
    revenueTimeline.length > 0
      ? revenueTimeline.map((entry) => entry.total)
      : PLACEHOLDER_REVENUE_SERIES;
  if (revenueTimeline.length > 0) {
    while (chartPoints.length < 7) {
      chartPoints.unshift(0); 
    }
  }

  return (
    <>
      <section className="admin-grid two-columns">
        {/* Card Doanh Thu */}
        <div className="admin-card" data-aos="fade-up">
          <div className="card-head">
            <div>
              <p className="label">Dòng tiền gần đây</p>
              <h3>{loading ? "Đang tải..." : formatCurrency(revenueTotal)}</h3>
            </div>
            <button className="btn ghost" onClick={() => onExport("pdf")}>
              <i className="bi bi-cloud-download me-2"></i> Xuất PDF
            </button>
          </div>
          <Sparkline points={chartPoints} />
          <div className="plan-breakdown">
            {TOP_PLANS.map((plan) => (
              <div key={plan.label}>
                <p className="mb-1 d-flex justify-content-between">
                  <span>{plan.label}</span>
                  <span>{plan.value}%</span>
                </p>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${plan.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Liên Hệ */}
        <div className="admin-card" data-aos="fade-up" data-aos-delay="100">
          <div className="card-head">
            <div>
              <p className="label">Liên hệ gần đây</p>
              <h3>{summary.pendingContacts || 0} yêu cầu mới</h3>
            </div>
            <button className="btn ghost">Xem tất cả</button>
          </div>
          <ul className="contact-list">
            {SAMPLE_CONTACTS.map((contact, index) => (
              <li key={index}>
                <div>
                  <strong>{contact.name}</strong>
                  <p className="text-muted mb-0">{contact.subject}</p>
                </div>
                <span className={`badge status-${contact.status === "Mới" ? "new" : "inprogress"}`}>
                  {contact.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="admin-grid two-columns">
        <div className="admin-card actions-card" data-aos="fade-up" data-aos-delay="100">
          <p className="label mb-3">Hành động nhanh</p>
          <div className="action-grid">
            {QUICK_ACTIONS.map((action) => (
              <button className={`action-chip ${action.accent}`} key={action.title}>
                <i className={`bi ${action.icon}`}></i> {action.title}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}