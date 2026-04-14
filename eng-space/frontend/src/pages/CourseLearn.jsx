import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getCourseDetails, getMyEnrollments } from "../api";
import { useAuth } from "../context/AuthContext";

const PLAN_PRIORITY = {
  free: 0,
  plus: 1,
  business: 2,
  enterprise: 3,
};

const CourseLearn = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchCourse = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await getCourseDetails(slug);
        if (!ignore) setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchCourse();
    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    let ignore = false;
    const checkEnrollment = async () => {
      if (!user || !course?._id) return;
      try {
        const { data } = await getMyEnrollments();
        if (ignore) return;
        const owned = data.some(
          (item) => item.course?._id === course._id || item.course?.slug === course.slug
        );
        setEnrolled(owned);
      } catch (err) {
        console.error(err);
      }
    };
    checkEnrollment();
    return () => {
      ignore = true;
    };
  }, [user, course]);

  const access = useMemo(() => {
    if (!course || !user) return { unlocked: false };
    const availablePlans = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
    const lowestPlanPriority = availablePlans.length
      ? Math.min(
          ...availablePlans.map((plan) =>
            Number.isFinite(PLAN_PRIORITY[plan]) ? PLAN_PRIORITY[plan] : Number.POSITIVE_INFINITY
          )
        )
      : Number.POSITIVE_INFINITY;
    const userPlanRank = PLAN_PRIORITY[user.plan] ?? 0;
    const hasPlanAccess =
      Boolean(user.planActive && userPlanRank > 0) && userPlanRank >= lowestPlanPriority;
    const isFreeCourse = (course.price ?? 0) === 0 && course.allowIndividualPurchase !== false;
    return {
      unlocked: enrolled || hasPlanAccess || isFreeCourse,
      needsPlan: availablePlans.length > 0 && !hasPlanAccess && !isFreeCourse,
      lowestPlan: availablePlans[0],
    };
  }, [course, user, enrolled]);

  if (!user) {
    return <Navigate to={`/courses/${slug || ""}`} replace />;
  }

  if (loading) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Đang mở nội dung học tập...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <p>Không tìm thấy khoá học.</p>
            <Link to="/courses" className="btn btn-primary mt-3">
              Quay lại danh sách
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!access.unlocked) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <h2>Bạn chưa được mở khoá khoá học này</h2>
            <p className="text-muted mb-4">
              Mua lẻ hoặc nâng cấp gói {access.lowestPlan ? access.lowestPlan.toUpperCase() : "Plus"} để truy cập nội dung.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link to={`/courses/${slug}`} className="btn btn-outline-primary">
                Xem chi tiết khoá học
              </Link>
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate(`/checkout/${slug}`, {
                    state: { courseId: course?._id, courseSlug: course?.slug || slug, course },
                  })
                }
              >
                Mua khoá học
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];

  return (
    <main className="main course-learn-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-2 mb-lg-0">Học: {course.title}</h1>
            <p className="mb-0 text-muted">{course.description}</p>
          </div>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li className="current">Learn</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h3 className="h5 mb-4">Nội dung bài học</h3>
                  {curriculum.length === 0 ? (
                    <p>Khoá học sẽ cập nhật nội dung sớm.</p>
                  ) : (
                    <div className="accordion" id="learnAccordion">
                      {curriculum.map((module, index) => {
                        const moduleId = module.id || `learn-module-${index}`;
                        return (
                          <div className="accordion-item" key={moduleId}>
                            <h2 className="accordion-header">
                              <button
                                className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#${moduleId}`}
                              >
                                <div className="d-flex flex-column">
                                  <span className="fw-semibold">{module.title}</span>
                                  <small className="text-muted">{module.meta}</small>
                                </div>
                              </button>
                            </h2>
                            <div
                              id={moduleId}
                              className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                              data-bs-parent="#learnAccordion"
                            >
                              <div className="accordion-body">
                                {(module.lessons || []).map((lesson, lessonIdx) => (
                                  <div className="lesson-row" key={`${moduleId}-${lessonIdx}`}>
                                    <div>
                                      <i className={`bi ${lesson.type === "text" ? "bi-file-earmark-text" : "bi-play-circle"}`}></i>
                                      <span className="ms-2">{lesson.title}</span>
                                    </div>
                                    {lesson.time && <span className="text-muted small">{lesson.time}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="h6 mb-3">Tổng quan</h4>
                  <ul className="list-unstyled small text-muted mb-4">
                    <li className="mb-2"><i className="bi bi-clock me-2 text-primary"></i>Thời lượng: {course.durationHours ? `${course.durationHours} giờ` : "Đang cập nhật"}</li>
                    <li className="mb-2"><i className="bi bi-people me-2 text-primary"></i>{course.studentsCount?.toLocaleString() || 0} học viên</li>
                    <li className="mb-2"><i className="bi bi-speedometer me-2 text-primary"></i>Cấp độ: {course.level}</li>
                  </ul>
                  <div className="d-flex flex-column gap-2">
                    <Link to={`/courses/${slug}`} className="btn btn-outline-primary">
                      Xem thông tin khoá học
                    </Link>
                    <button className="btn btn-primary" onClick={() => navigate("/account?tab=courses")}>
                      Xem khoá học đã mua
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CourseLearn;

