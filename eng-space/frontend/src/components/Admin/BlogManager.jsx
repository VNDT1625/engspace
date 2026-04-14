import React from "react";

export default function BlogManager() {
  return (
    <section className="admin-grid blog-grid">
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <div>
            <p className="label">Quản lý bài viết</p>
            <h3>Bài viết nổi bật</h3>
          </div>
          <button className="btn primary"><i className="bi bi-plus-lg me-1"></i> Bài viết mới</button>
        </div>
        
        {/* Sample Static Data - Kết nối API vào đây sau này */}
        <div className="blog-list">
          <div>
            <p className="mb-1 text-muted small">14/05/2025</p>
            <h4 className="h6 mb-1">Lộ trình IELTS 7.5 trong 3 tháng</h4>
            <span className="badge text-bg-success">Published</span>
          </div>
          <div className="blog-actions">
            <button className="btn ghost"><i className="bi bi-pencil"></i></button>
            <button className="btn ghost text-danger"><i className="bi bi-trash"></i></button>
          </div>
        </div>

        <div className="blog-list">
          <div>
            <p className="mb-1 text-muted small">12/05/2025</p>
            <h4 className="h6 mb-1">57 mẫu email business không thể bỏ qua</h4>
            <span className="badge text-bg-warning">Draft</span>
          </div>
          <div className="blog-actions">
            <button className="btn ghost"><i className="bi bi-pencil"></i></button>
            <button className="btn ghost text-danger"><i className="bi bi-trash"></i></button>
          </div>
        </div>
      </div>

      <div className="admin-card" data-aos="fade-up" data-aos-delay="100">
        <h3 className="h6 mb-3">Nháp nhanh ý tưởng</h3>
        <textarea className="form-control mb-3" rows="6" placeholder="Viết ý tưởng blog của bạn vào đây..."></textarea>
        <button className="btn primary w-100">Lưu nháp</button>
        <p className="text-muted small mt-3 mb-0">
            <i className="bi bi-info-circle me-1"></i>
            Tính năng editor đầy đủ sẽ được cập nhật trong phiên bản sau.
        </p>
      </div>
    </section>
  );
}