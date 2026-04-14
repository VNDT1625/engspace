import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getQuizzes, getQuizHistory } from '../api';
import { useAuth } from '../context/AuthContext';
import '../assets/css/quiz-custom.css';

const categoryIconMap = {
  Communication: 'bi bi-chat-left-text',
  Career: 'bi bi-briefcase',
  English: 'bi bi-translate',
  'Web Development': 'bi bi-laptop',
  Design: 'bi bi-brush',
  Science: 'bi bi-flask',
  Mathematics: 'bi bi-calculator',
  General: 'bi bi-mortarboard',
};

const HERO_QUIZ_IMAGE = '/assets/img/education/students-9.webp';
const DEFAULT_QUIZ_IMAGE = '/assets/img/education/courses-13.webp';

export default function Quiz() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    console.log('fetchQuizzes running');
    let ignore = false;
    const fetchQuizzes = async () => {
      try {
        const res = await getQuizzes();
        if (!ignore) {
          setQuizzes(res.data);
          console.log('quizzes data', res.data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Không thể tải danh sách quiz. Vui lòng thử lại sau.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchQuizzes();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setHistory([]);
      return;
    }
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await getQuizHistory();
        if (!ignore) setHistory(data || []);
      } catch (err) {
        if (!ignore) console.error(err);
      } finally {
        if (!ignore) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      ignore = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const quizCount = quizzes.length;
    const historyCount = history.length;
    const completedCount = history.filter((attempt) => (attempt.totalQuestions ?? 0) > 0).length;
    const totalCorrect = history.reduce((sum, attempt) => sum + (attempt.correctAnswers || 0), 0);
    const totalQuestions = history.reduce((sum, attempt) => sum + (attempt.totalQuestions || 0), 0);
    const completionRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const bestScore = history.reduce((max, attempt) => {
      const score = attempt.score ?? 0;
      return score > max ? score : max;
    }, 0);
    const lastQuizTitle = history[0]?.quiz?.title;

    return {
      quizCount,
      historyCount: completedCount,
      completionRate,
      bestScore,
      lastQuizTitle,
    };
  }, [quizzes, history]);

  const featuredQuizzes = useMemo(() => quizzes.slice(0, 3), [quizzes]);

  const categories = useMemo(() => {
    const map = new Map();
    quizzes.forEach((quiz) => {
      const key = quiz.category || 'General';
      const count = map.get(key) || 0;
      map.set(key, count + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        icon: categoryIconMap[name] || categoryIconMap.General,
      }))
      .slice(0, 6);
  }, [quizzes]);

  return (
    <main className="main quiz-page">

      {/* Quiz Hero Section */}
      <section id="quiz-hero" className="quiz-hero section light-background">
        <div className="hero-content">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="hero-text">
                  <h1>Luyện tiếng Anh thú vị với các quiz tương tác</h1>
                  <p>
                    Chọn quiz theo chủ đề tiếng Anh giao tiếp, từ vựng và công sở. 
                    Vừa học vừa chơi để nâng trình tiếng Anh mỗi ngày!
                  </p>
                  <div className="hero-buttons">
                    <Link to="#quizzes" className="btn btn-primary">Khám phá Quiz</Link>
                    <Link to="#about" className="btn btn-outline">Tìm hiểu thêm</Link>
                  </div>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="label">{user ? "Xin chào 👋, " : "Đăng nhập để lưu tiến độ"}</span>
                      <span className="number">{user ? user.name : "Khách"}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Quiz đã hoàn thành: </span>
                      <span className="number">{historyLoading ? "…" : stats.historyCount}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Điểm trung bình: </span>
                      <span className="number">{historyLoading ? "…" : `${stats.completionRate}%`}</span>
                    </div>
                  </div>
                  {stats.lastQuizTitle && (
                    <div className="hero-last-quiz">
                      <p className="mb-0 text-muted">
                        Quiz gần nhất: <strong>{stats.lastQuizTitle}</strong> • Điểm cao nhất:{" "}
                        <strong>{stats.bestScore}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="hero-image">
                  <img src={HERO_QUIZ_IMAGE} alt="Quiz Hero" className="img-fluid rounded-4 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="container">
          <div className="alert alert-danger mt-4">{error}</div>
        </div>
      )}

      {/* Featured Quizzes Section */}
      <section id="featured-quizzes" className="featured-quizzes section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Quiz tiếng Anh nổi bật</h2>
          <p>Ôn luyện tiếng Anh qua các quiz ngắn, phù hợp nhiều trình độ khác nhau.</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {loading && (
              <div className="col-12 text-center">
                <p>Đang tải danh sách quiz tiếng Anh...</p>
              </div>
            )}

            {!loading && featuredQuizzes.length === 0 && (
              <div className="col-12 text-center">
                <p>Hiện chưa có quiz nào. Hãy quay lại sau nhé!</p>
              </div>
            )}

            {featuredQuizzes.map((quiz, index) => (
              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={(index + 2) * 100}
                key={quiz._id}
              >
                <div className="quiz-card">
                  <div className="quiz-image">
                    <img
                      src={quiz.image || DEFAULT_QUIZ_IMAGE}
                      alt={quiz.title}
                      className="img-fluid"
                    />
                    <div className={`badge ${index === 0 ? 'featured' : index === 1 ? 'new' : 'certificate'}`}>
                      {index === 0 ? 'Hot' : index === 1 ? 'New' : 'Certificate'}
                    </div>
                  </div>
                  <div className="quiz-content">
                    <h3>
                      <Link to={`/quiz/${quiz.slug}`}>{quiz.title}</Link>
                    </h3>
                    <p>{quiz.description}</p>
                    <div className="quiz-stats">
                      <div>
                        <i className="bi bi-people-fill"></i> {quiz.players?.toLocaleString() || 0} người đã làm
                      </div>
                      <div>
                        <i className="bi bi-clock"></i> {quiz.duration || '15 phút'}
                      </div>
                    </div>
                    <Link to={`/quiz/${quiz.slug}`} className="btn-quiz">
                      Bắt đầu làm quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="more-quizzes text-center" data-aos="fade-up" data-aos-delay="500">
            <Link to="/quiz" className="btn-more">Xem tất cả quiz</Link>
          </div>
        </div>
      </section>

      {/* Quiz Categories Section */}
      <section id="quiz-categories" className="quiz-categories section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Chủ đề quiz</h2>
          <p>Chọn chủ đề luyện tiếng Anh bạn quan tâm.</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4">
            {!loading && categories.length === 0 && (
              <div className="col-12 text-center">
                <p>Chưa có chủ đề quiz nào.</p>
              </div>
            )}

            {categories.map((category, index) => (
              <div
                className="col-xl-2 col-lg-3 col-md-4 col-sm-6"
                data-aos="zoom-in"
                data-aos-delay={(index + 1) * 100}
                key={category.name}
              >
                <Link to={`/quiz?category=${encodeURIComponent(category.name)}`} className="category-card">
                  <div className="category-icon">
                    <i className={category.icon}></i>
                  </div>
                  <h5>{category.name}</h5>
                  <span className="quiz-count">{category.count} quiz</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="cta section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
              <div className="cta-content">
                <h2>Thử thách tiếng Anh, nâng trình giao tiếp</h2>
                <p>Làm quiz thường xuyên để ghi nhớ từ vựng, cấu trúc câu và phản xạ tiếng Anh tốt hơn.</p>
                <div className="cta-actions" data-aos="fade-up" data-aos-delay="500">
                  <Link to="/quiz" className="btn btn-primary">Duyệt tất cả quiz</Link>
                  <Link to="/quiz" className="btn btn-outline">Bắt đầu ngay</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <div className="cta-image">
                <img src="/assets/img/education/quiz-cta.webp" alt="Quiz Learning" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

