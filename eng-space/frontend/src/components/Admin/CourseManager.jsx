import React, { useState, useEffect, useMemo } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse, uploadImage, getImageUrl } from "../../api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function CourseManager() {
  const initialCourseForm = useMemo(
    () => ({
      title: "",
      slug: "",
      description: "",
      price: 0,
      category: "IELTS",
      level: "Beginner",
      featured: false,
      image: "",
    }),
    []
  );
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // State mới thay thế cho document.getElementById
  const [imageMode, setImageMode] = useState("upload");
  const [imageUploading, setImageUploading] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data } = await getCourses();
      setCourses(data || []);
    } catch (error) {
      setFeedback({ type: "error", message: "Không tải được danh sách khóa học." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      slug: course.slug || "",
      description: course.description || "",
      price: course.price || 0,
      category: course.category || "General",
      level: course.level || "Beginner",
      featured: Boolean(course.featured),
      image: course.image || "",
    });
    // Tự động chuyển tab ảnh nếu có url
    if (course.image && !course.image.startsWith("blob")) setImageMode("url");
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;
    try {
      await deleteCourse(id);
      await loadCourses();
      if (editingCourse?._id === id) resetForm();
    } catch (error) {
      setFeedback({ type: "error", message: "Không thể xóa khóa học." });
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setCourseForm(initialCourseForm);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = { ...courseForm, price: Number(courseForm.price) || 0 };
      if (!payload.slug) delete payload.slug;

      if (editingCourse?._id) {
        await updateCourse(editingCourse._id, payload);
        setFeedback({ type: "success", message: "Đã cập nhật khóa học." });
      } else {
        await createCourse(payload);
        setFeedback({ type: "success", message: "Đã tạo khóa học mới." });
      }
      await loadCourses();
      resetForm();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Lỗi khi lưu khóa học." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-grid two-columns">
      {/* Danh sách */}
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <h3>{courses.length} khoá học</h3>
          <button className="btn ghost" onClick={loadCourses} disabled={loading}>
            <i className="bi bi-arrow-clockwise"></i> Làm mới
          </button>
        </div>
        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Tên</th><th>Giá</th><th>Danh mục</th><th></th></tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.title}</strong>
                    <p className="text-muted small mb-0">{c.level}</p>
                  </td>
                  <td>{formatCurrency(c.price)}</td>
                  <td>{c.category}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEditCourse(c)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCourse(c._id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      <div className="admin-card" data-aos="fade-up" data-aos-delay="100">
        <div className="card-head">
          <h3>{editingCourse ? "Chỉnh sửa" : "Tạo mới"}</h3>
          {editingCourse && <button className="btn ghost" onClick={resetForm}>Tạo mới</button>}
        </div>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="mb-3">
            <label className="form-label">Tên khóa học</label>
            <input type="text" className="form-control" name="title" value={courseForm.title} onChange={handleCourseChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả ngắn</label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              placeholder="Mô tả ngắn sẽ hiển thị trên danh sách khóa học..."
              value={courseForm.description}
              onChange={handleCourseChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            <div className="btn-group w-100 mb-2">
              <input type="radio" className="btn-check" name="imgMode" id="modeUp" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} />
              <label className="btn btn-outline-primary" htmlFor="modeUp">Upload File</label>
              <input type="radio" className="btn-check" name="imgMode" id="modeUrl" checked={imageMode === "url"} onChange={() => setImageMode("url")} />
              <label className="btn btn-outline-primary" htmlFor="modeUrl">Nhập URL</label>
            </div>
            {imageMode === "upload" ? (
              <div>
                <input 
                    type="file" 
                    className="form-control" 
                    onChange={async (e) => {
                        const file = e.target.files[0];
                        if(!file) return;
                        setImageUploading(true);
                        try {
                            const formData = new FormData();
                            formData.append('image', file);
                            const { data } = await uploadImage(formData);
                            const url = data?.url || `/uploads/${data.filename}`;
                            setCourseForm(prev => ({...prev, image: url}));
                        } catch(err) {
                            alert("Lỗi upload ảnh");
                        } finally {
                            setImageUploading(false);
                        }
                    }} 
                    disabled={imageUploading}
                />
                {imageUploading && <small className="text-muted">Đang tải lên...</small>}
              </div>
            ) : (
              <input type="text" className="form-control" name="image" value={courseForm.image} onChange={handleCourseChange} placeholder="https://..." />
            )}
            {courseForm.image && <div className="mt-2"><img src={getImageUrl(courseForm.image)} alt="Preview" style={{height: 80}} className="rounded me-2"/></div>}
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Giá</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={courseForm.price}
                onChange={handleCourseChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Trình độ</label>
              <select
                className="form-select"
                name="level"
                value={courseForm.level}
                onChange={handleCourseChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Danh mục (nhãn)</label>
              <select
                className="form-select"
                name="category"
                value={courseForm.category}
                onChange={handleCourseChange}
              >
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="English Communication">English Communication</option>
                <option value="Business English">Business English</option>
                <option value="Kids English">Kids English</option>
                <option value="General English">General English</option>
              </select>
            </div>
          </div>
          <button className="btn primary w-100" disabled={saving}>{saving ? "Đang lưu..." : "Lưu khóa học"}</button>
        </form>
      </div>
    </section>
  );
}