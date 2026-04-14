import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../assets/css/quiz-custom.css";
import { getQuizBySlug, recordQuizResult } from "../api";
import { useAuth } from "../context/AuthContext";

export default function QuizDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getQuizBySlug(slug);
        setQuiz(res.data);
      } catch (err) {
        console.error(err);
        setError("Quiz không tồn tại hoặc đã bị xoá.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [slug]);

  const progress = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  }, [answers, quiz]);

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const persistResult = async (computedResult) => {
    if (!user) {
      setSaveStatus({
        type: "info",
        message: "Đăng nhập để lưu điểm và theo dõi lịch sử quiz của bạn.",
      });
      return;
    }
    if (!quiz?._id) return;
    setSavingAttempt(true);
    setSaveStatus(null);
    try {
      await recordQuizResult({
        quizId: quiz._id,
        score: computedResult.percentage,
        correctAnswers: computedResult.correct,
        totalQuestions: computedResult.total,
      });
      setSaveStatus({
        type: "success",
        message: "Đã lưu kết quả quiz vào lịch sử của bạn.",
      });
    } catch (err) {
      const message = err.response?.data?.message || "Không thể lưu kết quả lúc này.";
      setSaveStatus({
        type: "error",
        message,
      });
    } finally {
      setSavingAttempt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz?.questions?.length) return;
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct += 1;
      }
    });
    const computedResult = {
      correct,
      total: quiz.questions.length,
      percentage: Math.round((correct / quiz.questions.length) * 100),
    };
    setResult(computedResult);
    await persistResult(computedResult);
  };

  const handleRestart = () => {
    setAnswers({});
    setResult(null);
    setSaveStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center">
            <div className="loading-spinner"></div>
            <p>Đang tải quiz...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !quiz) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center">
            <p>{error || "Quiz không tồn tại."}</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        </section>
      </main>
    );
  }

  const infoCards = [
    {
      label: "Mức độ",
      value: quiz.level || "N/A",
      icon: "bi bi-lightning-charge",
    },
    {
      label: "Thời lượng",
      value: quiz.duration || "15 phút",
      icon: "bi bi-clock-history",
    },
    {
      label: "Người tham gia",
      value: `${quiz.players?.toLocaleString() || 0}+`,
      icon: "bi bi-people",
    },
    {
      label: "Tỉ lệ hoàn thành",
      value: `${quiz.completionRate || 0}%`,
      icon: "bi bi-graph-up",
    },
  ];

  return (
    <main className="main quiz-detail-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2 mb-lg-0">{quiz.title}</h1>
            <p className="mb-0">{quiz.description}</p>
          </div>
          <nav className="breadcrumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/quiz">Quiz</Link>
              </li>
              <li className="current">{quiz.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section quiz-detail-hero">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="quiz-hero-card">
                <span className="badge bg-primary-soft">{quiz.category}</span>
                <h2>{quiz.title}</h2>
                <p className="lead">{quiz.description}</p>
                <div className="quiz-meta">
                  <span className="badge bg-outline">{quiz.level}</span>
                  {quiz.course?.title && (
                    <Link to={`/courses/${quiz.courseSlug}`} className="meta-link">
                      <i className="bi bi-journal-richtext"></i> Thuộc khoá: {quiz.course.title}
                    </Link>
                  )}
                </div>
                <div className="progress mt-4">
                  <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }}>
                    {progress}% câu hỏi đã trả lời
                  </div>
                </div>
                <p className="progress-note mt-2">Trả lời tất cả câu hỏi tiếng Anh để xem kết quả chi tiết.</p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="quiz-hero-visual">
                <img
                  src={quiz.image || "/assets/img/education/quiz-1.webp"}
                  alt={quiz.title}
                  className="img-fluid rounded shadow-lg"
                />
                <div className="floating-card" data-aos="fade-left" data-aos-delay="200">
                  <span className="label">Trạng thái</span>
                  <strong>{progress === 100 ? "Sẵn sàng nộp" : "Đang làm"}</strong>
                  <small>{quiz.questions?.length || 0} câu hỏi</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 quiz-info-grid mt-1">
            {infoCards.map((card) => (
              <div className="col-md-3 col-sm-6" key={card.label}>
                <div className="info-card">
                  <div className="icon">
                    <i className={card.icon}></i>
                  </div>
                  <div>
                    <span className="label">{card.label}</span>
                    <h5>{card.value}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {quiz.tags?.length > 0 && (
            <div className="tag-list mt-3">
              {quiz.tags.map((tag) => (
                <span className="tag" key={tag}>
                  <i className="bi bi-hash"></i> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section quiz-question-section">
        <div className="container" data-aos="fade-up" data-aos-delay="200">
          <div className="row">
            <div className="col-lg-8">
              <form className="quiz-form" onSubmit={handleSubmit}>
                {quiz.questions?.map((question, index) => (
                  <div className="quiz-question-card" key={index}>
                    <div className="question-header">
                      <div>
                        <span className="question-number">Câu {index + 1}</span>
                        <h3>{question.q}</h3>
                      </div>
                      <span className="question-type">{question.type === "text" ? "Lý thuyết" : "Trắc nghiệm"}</span>
                    </div>

                    <div className="question-options">
                      {question.options.map((option) => (
                        <label
                          className={`option-card ${answers[index] === option ? "selected" : ""}`}
                          key={option}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={answers[index] === option}
                            onChange={() => handleAnswerChange(index, option)}
                          />
                          <span>{option}</span>
                          {answers[index] === option && <i className="bi bi-check-lg"></i>}
                        </label>
                      ))}
                    </div>

                    {result && (
                      <div className={`answer-feedback ${answers[index] === question.answer ? "correct" : "incorrect"}`}>
                        {answers[index] === question.answer ? (
                          <span>
                            <i className="bi bi-check-circle"></i> Chính xác!
                          </span>
                        ) : (
                          <span>
                            <i className="bi bi-x-circle"></i> Sai. Đáp án đúng: <strong>{question.answer}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <div className="quiz-actions">
                  {!result ? (
                    <button className="btn btn-primary w-100" type="submit" disabled={progress < 100}>
                      Nộp bài
                    </button>
                  ) : (
                    <div className="d-flex flex-column flex-md-row gap-3">
                      <button className="btn btn-outline-secondary flex-fill" type="button" onClick={handleRestart}>
                        Làm lại
                      </button>
                      <Link to="/quiz" className="btn btn-primary flex-fill">
                        Xem quiz khác
                      </Link>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="col-lg-4">
                <div className="result-sidebar" data-aos="fade-left" data-aos-delay="200">
                <h4>Tiến độ làm quiz</h4>
                <div className="progress-circle" style={{ "--progress": progress }}>
                  <span>{progress}%</span>
                </div>
                <p>{Object.keys(answers).length}/{quiz.questions?.length || 0} câu đã trả lời</p>
                {!result ? (
                  <p className="text-muted small">Hoàn thành tất cả câu hỏi để xem kết quả.</p>
                ) : (
                  <div className="quiz-result">
                    <div className="score">
                      <strong>{result.percentage}%</strong>
                      <span>Điểm số tiếng Anh</span>
                    </div>
                    <p>
                      Bạn trả lời đúng {result.correct}/{result.total} câu hỏi.
                    </p>
                    {savingAttempt && <p className="text-muted small mb-2">Đang lưu kết quả...</p>}
                    {saveStatus && (
                      <p className={`small mb-0 ${saveStatus.type === "success" ? "text-success" : saveStatus.type === "error" ? "text-danger" : "text-warning"}`}>
                        {saveStatus.message}
                      </p>
                    )}
                    {!savingAttempt && !saveStatus && (
                      <p className="text-success">Tuyệt vời! Tiếp tục luyện tập để cải thiện kỹ năng tiếng Anh.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="200">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h3>Khám phá thêm quiz khác</h3>
              <p className="mb-0">Tiếp tục thử thách bản thân với nhiều chủ đề hấp dẫn.</p>
            </div>
            <div>
              <Link to="/quiz" className="btn btn-secondary me-2">
                Quay lại danh sách
              </Link>
              {quiz.courseSlug && (
                <Link to={`/courses/${quiz.courseSlug}`} className="btn btn-outline-primary">
                  Xem khoá học liên quan
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

