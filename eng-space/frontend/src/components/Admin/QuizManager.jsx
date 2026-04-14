import React, { useState, useEffect } from "react";
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz } from "../../api";

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const initialForm = {
    title: "",
    slug: "",
    description: "",
    category: "General",
    level: "Beginner",
    duration: "15 phút",
    questions: [],
  };
  
  const [quizForm, setQuizForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const { data } = await getQuizzes();
      setQuizzes(data || []);
    } catch (error) {
      setFeedback({ type: "error", message: "Không tải được danh sách quiz." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        ...quizForm,
        slug: quizForm.slug?.trim() || quizForm.title?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      };

      if (editingQuiz?._id) {
        await updateQuiz(editingQuiz._id, payload);
        setFeedback({ type: "success", message: "Đã cập nhật quiz." });
      } else {
        await createQuiz(payload);
        setFeedback({ type: "success", message: "Đã tạo quiz mới." });
      }
      await loadQuizzes();
      handleReset();
    } catch (error) {
      setFeedback({ type: "error", message: error.response?.data?.message || "Không thể lưu quiz." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa quiz này?")) return;
    try {
      await deleteQuiz(id);
      await loadQuizzes();
      if (editingQuiz?._id === id) handleReset();
    } catch (error) {
      setFeedback({ type: "error", message: "Không thể xóa quiz." });
    }
  };

  const handleReset = () => {
    setEditingQuiz(null);
    setQuizForm(initialForm);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
        title: quiz.title || "",
        slug: quiz.slug || "",
        description: quiz.description || "",
        category: quiz.category || "General",
        level: quiz.level || "Beginner",
        duration: quiz.duration || "15 phút",
        questions: quiz.questions || []
    });
  };

  return (
    <section className="admin-grid two-columns">
      {/* Danh sách Quiz */}
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <h3>{quizzes.length} quiz</h3>
          <button className="btn ghost" onClick={loadQuizzes} disabled={loading}>
            <i className="bi bi-arrow-clockwise"></i> Làm mới
          </button>
        </div>
        {feedback && <div className={`alert alert-${feedback.type === "success" ? "success" : "danger"}`}>{feedback.message}</div>}
        
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Tên quiz</th><th>Danh mục</th><th>Trình độ</th><th>Số câu</th><th></th></tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q._id}>
                  <td>
                    <strong>{q.title}</strong>
                    <p className="text-muted small mb-0">{q.slug}</p>
                  </td>
                  <td>{q.category}</td>
                  <td>{q.level}</td>
                  <td>{q.questions?.length || 0}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(q)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(q._id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Quiz */}
      <div className="admin-card" data-aos="fade-up" data-aos-delay="100">
        <div className="card-head">
          <h3>{editingQuiz ? "Sửa Quiz" : "Tạo mới"}</h3>
          {editingQuiz && <button className="btn ghost" onClick={handleReset}>Tạo mới</button>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên Quiz</label>
            <input className="form-control" name="title" value={quizForm.title} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Slug</label>
            <input className="form-control" name="slug" value={quizForm.slug} onChange={handleChange} placeholder="Tự động tạo nếu để trống" />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Danh mục</label>
              <input className="form-control" name="category" value={quizForm.category} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
               <label className="form-label">Trình độ</label>
               <select className="form-select" name="level" value={quizForm.level} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
               </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Thời lượng</label>
            <input className="form-control" name="duration" value={quizForm.duration} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" name="description" rows="3" value={quizForm.description} onChange={handleChange}></textarea>
          </div>
          <button className="btn primary w-100" disabled={saving}>{saving ? "Đang lưu..." : "Lưu Quiz"}</button>
        </form>
      </div>
    </section>
  );
}