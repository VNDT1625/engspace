import React, { useState, useEffect } from "react";
import { getContacts, updateContactStatus } from "../../api";

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedContact, setSelectedContact] = useState(null); // State để hiện modal

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const { data } = await getContacts(params);
      setContacts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [filterStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateContactStatus(id, newStatus);
      loadContacts();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  return (
    <section className="admin-grid">
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <div>
            <p className="label">Hộp thư hỗ trợ</p>
            <h3>{contacts.length} tin nhắn</h3>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="new">Mới</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
            <button className="btn ghost" onClick={loadContacts} disabled={loading}>
                <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {loading ? <p>Đang tải...</p> : contacts.length === 0 ? <p className="text-muted">Không có dữ liệu.</p> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr><th>Người gửi</th><th>Email</th><th>Chủ đề</th><th>Trạng thái</th><th>Ngày gửi</th><th></th></tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.subject}</td>
                    <td>
                      <select 
                        className={`form-select form-select-sm border-${c.status === 'new' ? 'primary' : 'secondary'}`} 
                        value={c.status} 
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      >
                        <option value="new">Mới</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã xong</option>
                      </select>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedContact(c)}>Xem</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Modal View Details */}
      {selectedContact && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedContact.subject}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedContact(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Người gửi:</strong> {selectedContact.name} ({selectedContact.email})</p>
                <p><strong>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString("vi-VN")}</p>
                <hr/>
                <p className="mb-1"><strong>Nội dung:</strong></p>
                <p className="bg-light p-3 rounded">{selectedContact.message}</p>
                {selectedContact.notes && (
                    <div className="alert alert-info mt-2">
                        <strong>Ghi chú nội bộ:</strong> {selectedContact.notes}
                    </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedContact(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}