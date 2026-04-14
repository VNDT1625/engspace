import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminSummary, exportRevenueDoc, exportRevenuePdf } from "../api";

// Import các components con đã tách
import DashboardStats from "../components/Admin/DashboardStats";
import CourseManager from "../components/Admin/CourseManager";
import UserManager from "../components/Admin/UserManager";
import QuizManager from "../components/Admin/QuizManager"; // Bạn tự tạo file này dựa trên code cũ
import ContactManager from "../components/Admin/ContactManager"; // Bạn tự tạo file này dựa trên code cũ
import BlogManager from "../components/Admin/BlogManager"; // Bạn tự tạo file này dựa trên code cũ
import RevenueReport from "../components/Admin/RevenueReport"; // Bạn tự tạo file này

const ADMIN_NAV = [
  { label: "Tổng quan", icon: "bi-speedometer2", key: "dashboard" },
  { label: "Khóa học", icon: "bi-easel3", key: "courses" },
  { label: "Quiz", icon: "bi-controller", key: "quizzes" },
  { label: "Người dùng", icon: "bi-people", key: "users" },
  { label: "Doanh thu", icon: "bi-bar-chart-line", key: "revenue" },
  { label: "Blog", icon: "bi-journal-richtext", key: "blog" },
  { label: "Liên hệ", icon: "bi-inbox", key: "contact" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [summary, setSummary] = useState({ revenue: { total: 0, timeline: [] }, pendingContacts: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | EngSpace";
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const { data } = await getAdminSummary();
        setSummary(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (type) => {
    try {
      const fn = type === "pdf" ? exportRevenuePdf : exportRevenueDoc;
      const response = await fn();
      const blob = new Blob([response.data], { type: type === "pdf" ? "application/pdf" : "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report.${type === "pdf" ? "pdf" : "docx"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Lỗi xuất file");
    }
  };

  if (!user) return <Navigate to="/enroll" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand"><i className="bi bi-stars"></i> <span>EngSpace Admin</span></div>
        <nav>
          {ADMIN_NAV.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeNav === item.key ? "active" : ""}`}
              onClick={() => setActiveNav(item.key)}
            >
              <i className={`bi ${item.icon}`}></i> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="text-muted small mb-1">Đang đăng nhập</p>
          <strong>{user.name}</strong>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
             <p className="text-muted mb-1">Xin chào, {user.name}</p>
             <h1 className="admin-title">
                {ADMIN_NAV.find(n => n.key === activeNav)?.label || "Dashboard"}
             </h1>
          </div>
        </header>

        {/* Content Render */}
        {activeNav === "dashboard" && (
          <DashboardStats summary={summary} loading={summaryLoading} onExport={handleExport} />
        )}
        
        {activeNav === "courses" && <CourseManager />}
        
        {activeNav === "users" && <UserManager currentUser={user} />}
        
        {activeNav === "quizzes" && <QuizManager />}
        
        {activeNav === "contact" && <ContactManager />}
        
        {activeNav === "blog" && <BlogManager />}
        
        {activeNav === "revenue" && (
            <RevenueReport summary={summary} onExport={handleExport} />
        )}

      </main>
    </div>
  );
}