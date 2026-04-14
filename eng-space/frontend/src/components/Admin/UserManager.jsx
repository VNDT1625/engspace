import React, { useState, useEffect } from "react";
import { getUsers, createAdmin, updateUserRole, deleteUser } from "../../api";

export default function UserManager({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ role: "", search: "" });
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.role) params.role = filter.role;
      if (filter.search) params.search = filter.search;
      const { data } = await getUsers(params);
      setUsers(data || []);
    } catch (err) {
      setFeedback({ type: "error", message: "Lỗi tải danh sách user." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 500);
    return () => clearTimeout(timer);
  }, [filter]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAdmin(adminForm);
      setFeedback({ type: "success", message: "Tạo admin thành công!" });
      setAdminForm({ name: "", email: "", password: "" });
      loadUsers();
    } catch (err) {
        setFeedback({ type: "error", message: err.response?.data?.message || "Lỗi tạo admin" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-grid two-columns">
      <div className="admin-card">
        <div className="card-head">
           <h3>Quản lý User ({users.length})</h3>
           <button className="btn ghost" onClick={loadUsers}><i className="bi bi-arrow-clockwise"></i></button>
        </div>
        <div className="row g-2 mb-3">
           <div className="col-6">
              <input className="form-control form-control-sm" placeholder="Tìm kiếm..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} />
           </div>
           <div className="col-6">
              <select className="form-select form-select-sm" value={filter.role} onChange={e => setFilter({...filter, role: e.target.value})}>
                 <option value="">Tất cả quyền</option>
                 <option value="student">Học viên</option>
                 <option value="admin">Admin</option>
              </select>
           </div>
        </div>
        {feedback && <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'}`}>{feedback.message}</div>}
        
        <div className="table-responsive">
          <table className="table align-middle">
             <thead><tr><th>Tên/Email</th><th>Quyền</th><th></th></tr></thead>
             <tbody>
                {users.map(u => (
                    <tr key={u._id}>
                        <td>
                            <strong>{u.name}</strong><br/>
                            <small className="text-muted">{u.email}</small>
                        </td>
                        <td>
                            <select 
                                className="form-select form-select-sm" 
                                value={u.role} 
                                disabled={u._id === currentUser._id}
                                onChange={async (e) => {
                                    if(window.confirm("Đổi quyền user này?")) {
                                        await updateUserRole(u._id, e.target.value);
                                        loadUsers();
                                    }
                                }}
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </td>
                        <td className="text-end">
                            <button className="btn btn-sm btn-outline-danger" disabled={u._id === currentUser._id} onClick={async () => {
                                if(window.confirm("Xóa user này?")) {
                                    await deleteUser(u._id);
                                    loadUsers();
                                }
                            }}><i className="bi bi-trash"></i></button>
                        </td>
                    </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
         <div className="card-head"><h3>Tạo Admin Mới</h3></div>
         <form onSubmit={handleCreateAdmin}>
            <div className="mb-3">
                <label>Tên</label>
                <input className="form-control" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
            </div>
            <div className="mb-3">
                <label>Email</label>
                <input type="email" className="form-control" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
            </div>
            <div className="mb-3">
                <label>Mật khẩu</label>
                <input type="password" className="form-control" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required minLength={6}/>
            </div>
            <button className="btn primary w-100" disabled={saving}>Tạo Admin</button>
         </form>
      </div>
    </section>
  );
}