import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, getMyEnrollments, getQuizHistory, getMyContacts, getMyReadingResults } from "../api";

const tabConfig = [
  { id: "profile", label: "Thông tin cá nhân", icon: "bi bi-person-badge" },
  { id: "courses", label: "Khóa học đã mua", icon: "bi bi-journal-text" },
  { id: "quizzes", label: "Quiz đã làm", icon: "bi bi-clipboard-check" },
  { id: "readings", label: "Reading đã nộp", icon: "bi bi-book-half" },
  { id: "support", label: "Gói học & liên hệ", icon: "bi bi-life-preserver" },
];

const Account = () => {
  const { user, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "", confirmPassword: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingData, setLoadingData] = useState({ profile: true, enrollments: true, quizzes: true, readings: true, contacts: true });

  const activeTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    document.title = "Tài khoản của tôi | EngSpace";
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileForm((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      password: "",
      confirmPassword: "",
    }));
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await getProfile();
        await refreshProfile();
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData((prev) => ({ ...prev, profile: false }));
      }
    };
    const fetchEnrollments = async () => {
      try {
        const { data } = await getMyEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData((prev) => ({ ...prev, enrollments: false }));
      }
    };
    const fetchQuizHistory = async () => {
      try {
        const { data } = await getQuizHistory();
        setQuizHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData((prev) => ({ ...prev, quizzes: false }));
      }
    };
    const fetchContacts = async () => {
      try {
        const { data } = await getMyContacts();
        setContactMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData((prev) => ({ ...prev, contacts: false }));
      }
    };
    const fetchReadingHistory = async () => {
      try {
        const { data } = await getMyReadingResults();
        setReadingHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData((prev) => ({ ...prev, readings: false }));
      }
    };

    if (user) {
      fetchProfile();
      fetchEnrollments();
      fetchQuizHistory();
      fetchReadingHistory();
      fetchContacts();
    }
  }, [user, refreshProfile]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      setFeedback({ type: "error", message: "Mật khẩu xác nhận không trùng khớp." });
      return;
    }
    setSavingProfile(true);
    setFeedback(null);
    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        bio: profileForm.bio,
      };
      if (profileForm.password) {
        payload.password = profileForm.password;
      }
      await updateProfile(payload);
      await refreshProfile();
      setProfileForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setFeedback({ type: "success", message: "Cập nhật thông tin thành công." });
    } catch (error) {
      const message = error.response?.data?.message || "Không thể cập nhật thông tin.";
      setFeedback({ type: "error", message });
    } finally {
      setSavingProfile(false);
    }
  };

  const profileContent = (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-4">Thông tin cá nhân</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-3">
            <label className="form-label">Họ và tên</label>
            <input type="text" className="form-control" name="name" value={profileForm.name} onChange={handleProfileChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={profileForm.email} onChange={handleProfileChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Giới thiệu</label>
            <textarea className="form-control" rows="3" name="bio" value={profileForm.bio} onChange={handleProfileChange} placeholder="Viết đôi lời về bạn..."></textarea>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" className="form-control" name="password" value={profileForm.password} onChange={handleProfileChange} placeholder="Để trống nếu không đổi" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input type="password" className="form-control" name="confirmPassword" value={profileForm.confirmPassword} onChange={handleProfileChange} placeholder="Nhập lại mật khẩu" />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );

  const courseContent = (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-4">Khóa học đã mua</h3>
        {loadingData.enrollments ? (
          <p>Đang tải danh sách khóa học...</p>
        ) : enrollments.length === 0 ? (
          <p>Bạn chưa mua khóa học nào.</p>
        ) : (
          <div className="row g-4">
            {enrollments.map((enrollment) => {
              const courseSlug = enrollment.course?.slug;
              return (
                <div className="col-md-6" key={enrollment._id}>
                  <div className="border rounded-3 p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h4 className="h6 mb-2">{enrollment.course?.title || "Khóa học"}</h4>
                      <p className="text-muted mb-1">
                        Trạng thái: <span className="text-capitalize">{enrollment.status}</span>
                      </p>
                      <p className="text-muted mb-1">
                        Thanh toán: {enrollment.pricePaid ? `${enrollment.pricePaid.toLocaleString()} đ` : "Miễn phí"}
                      </p>
                      <p className="text-muted mb-0">
                        Ngày mua: {new Date(enrollment.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {courseSlug && (
                      <div className="mt-3">
                        <Link
                          to={`/courses/${courseSlug}/learn`}
                          className="btn btn-primary btn-sm w-100"
                        >
                          Vào học khóa này
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const quizContent = (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-4">Quiz đã làm</h3>
        {loadingData.quizzes ? (
          <p>Đang tải lịch sử quiz...</p>
        ) : quizHistory.length === 0 ? (
          <p>Bạn chưa hoàn thành quiz nào.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Điểm</th>
                  <th>Số câu đúng</th>
                  <th>Thời gian</th>
                  <th>Ngày làm</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{attempt.quiz?.title || "Quiz"}</td>
                    <td>{attempt.score ?? 0}</td>
                    <td>
                      {attempt.correctAnswers}/{attempt.totalQuestions}
                    </td>
                    <td>{attempt.durationSeconds ? `${attempt.durationSeconds}s` : "-"}</td>
                    <td>{new Date(attempt.takenAt || attempt.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const planDetail = useMemo(() => {
    if (!user) return null;
    const planLabelMap = {
      free: "Free",
      plus: "EngSpace Plus",
      business: "EngSpace Business",
      enterprise: "EngSpace Enterprise",
    };
    const planLabel = planLabelMap[user.plan] || "Free";
    const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("vi-VN") : "Không giới hạn";
    return { planLabel, expiresAt };
  }, [user]);

  const supportContent = (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-4">Gói học & liên hệ hỗ trợ</h3>
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="border rounded-3 p-3 h-100">
              <h4 className="h6 mb-3">Gói hiện tại</h4>
              <p className="mb-1"><strong>{planDetail?.planLabel || "Free"}</strong></p>
              <p className="text-muted mb-3">Hết hạn: {planDetail?.expiresAt || "Không giới hạn"}</p>
              <Link to="/pricing" className="btn btn-outline-primary btn-sm">
                Nâng cấp gói
              </Link>
            </div>
          </div>
          <div className="col-lg-7">
            <h4 className="h6 mb-3">Yêu cầu hỗ trợ đã gửi</h4>
            {loadingData.contacts ? (
              <p>Đang tải lịch sử liên hệ...</p>
            ) : contactMessages.length === 0 ? (
              <p>Bạn chưa gửi yêu cầu nào. <Link to="/contact">Gửi liên hệ ngay</Link>.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Chủ đề</th>
                      <th>Ngày gửi</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages.map((msg) => (
                      <tr key={msg._id}>
                        <td>
                          <strong>{msg.subject}</strong>
                          <p className="mb-0 text-muted small">{msg.message.slice(0, 80)}{msg.message.length > 80 ? "..." : ""}</p>
                        </td>
                        <td>{new Date(msg.createdAt).toLocaleString("vi-VN")}</td>
                        <td>
                          <span className={`badge text-bg-${msg.status === "resolved" ? "success" : msg.status === "in_progress" ? "warning" : "secondary"}`}>
                            {msg.status === "resolved" ? "Đã phản hồi" : msg.status === "in_progress" ? "Đang xử lý" : "Mới"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const readingContent = (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h5 mb-4">Lịch sử nộp Reading</h3>
        {loadingData.readings ? (
          <p>Đang tải lịch sử Reading...</p>
        ) : readingHistory.length === 0 ? (
          <p>Bạn chưa nộp bài Reading nào.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Bài Reading</th>
                  <th>Điểm</th>
                  <th>Đúng</th>
                  <th>Thời gian làm</th>
                  <th>Highlights</th>
                  <th>Thời điểm nộp</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readingHistory.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{attempt.reading?.title || "Reading"}</td>
                    <td>{attempt.score ?? 0}</td>
                    <td>{attempt.correctAnswers ?? 0}/{attempt.totalGradableQuestions ?? 0}</td>
                    <td>{attempt.durationSeconds ? `${attempt.durationSeconds}s` : "-"}</td>
                    <td>{attempt.highlights?.length || 0}</td>
                    <td>{new Date(attempt.submittedAt || attempt.createdAt).toLocaleString("vi-VN")}</td>
                    <td>
                      <Link to={`/reading-results/${attempt._id}`} className="btn btn-sm btn-outline-primary">
                        Xem bài làm + note
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const contentByTab = {
    profile: profileContent,
    courses: courseContent,
    quizzes: quizContent,
    readings: readingContent,
    support: supportContent,
  };

  if (!user) {
    return <Navigate to="/enroll" replace />;
  }

  return (
    <main className="main pt-4 pb-5">
      <div className="container" data-aos="fade-up">
        <div className="page-title light-background mb-4">
          <div className="container d-lg-flex justify-content-between align-items-center">
            <h1 className="mb-2 mb-lg-0">Hồ sơ của bạn</h1>
          </div>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"}`}>
            {feedback.message}
          </div>
        )}

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="list-group">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="col-lg-9">
            {loadingData.profile && activeTab === "profile" ? <p>Đang tải thông tin...</p> : contentByTab[activeTab] || profileContent}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Account;

