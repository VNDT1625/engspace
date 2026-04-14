import React from "react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function RevenueReport({ summary, onExport }) {
  const revenueTotal = summary.revenue?.total || 0;
  const timeline = summary.revenue?.timeline || [];

  return (
    <section className="admin-grid">
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <div>
            <p className="label">Báo cáo tài chính</p>
            <h3>Tổng doanh thu: {formatCurrency(revenueTotal)}</h3>
          </div>
          <div className="d-flex gap-2">
            <button className="btn ghost" onClick={() => onExport("pdf")}>
              <i className="bi bi-filetype-pdf me-1"></i> Xuất PDF
            </button>
            <button className="btn ghost" onClick={() => onExport("doc")}>
              <i className="bi bi-filetype-doc me-1"></i> Xuất Word
            </button>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div className="table-responsive mt-3">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Ngày giao dịch</th>
                  <th>Số đơn hàng</th>
                  <th>Doanh thu ngày</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((entry) => (
                  <tr key={entry._id}>
                    <td>{new Date(entry._id).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                    <td>{entry.count || 1} đơn</td>
                    <td className="text-success fw-bold">{formatCurrency(entry.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
             <i className="bi bi-clipboard-data display-4 mb-3 d-block"></i>
             <p>Chưa có dữ liệu giao dịch nào được ghi nhận.</p>
          </div>
        )}
      </div>
    </section>
  );
}