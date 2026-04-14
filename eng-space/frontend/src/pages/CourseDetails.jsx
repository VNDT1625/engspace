import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCourseDetails, getMyEnrollments, getImageUrl } from "../api";
import { useAuth } from "../context/AuthContext";

const formatDuration = (hours) => {
  if (!hours || Number.isNaN(Number(hours))) return null;
  if (hours < 1) return `${Math.round(hours * 60)} phút`;
  if (hours % 1 === 0) return `${hours} giờ`;
  return `${hours.toFixed(1)} giờ`;
};

const defaultSkills = [
  {
    title: "Frontend Development",
    details: "React, JavaScript ES6+, HTML5 & CSS3",
    icon: "bi bi-code-slash",
  },
  {
    title: "Backend Development",
    details: "Node.js, Express.js, RESTful APIs",
    icon: "bi bi-server",
  },
  {
    title: "Database Management",
    details: "MongoDB, Mongoose, Data Modeling",
    icon: "bi bi-database",
  },
  {
    title: "Security & Testing",
    details: "Authentication, JWT, Unit Testing",
    icon: "bi bi-shield-check",
  },
];

const defaultRequirements = [
  "Basic understanding of HTML and CSS",
  "Familiarity with JavaScript fundamentals",
  "Computer with internet connection",
  "Text editor or IDE installed",
];

const defaultCurriculum = [
  {
    id: "module1",
    title: "JavaScript Fundamentals & ES6+",
    meta: "8 lessons • 4h 15m",
    expanded: true,
    lessons: [
      { type: "video", title: "Variables, Functions and Scope", time: "28 min" },
      { type: "video", title: "Arrow Functions and Destructuring", time: "35 min" },
      { type: "text", title: "Promises and Async/Await", time: "42 min" },
    ],
  },
  {
    id: "module2",
    title: "React Development Deep Dive",
    meta: "12 lessons • 7h 45m",
    lessons: [
      { type: "video", title: "Components and JSX Syntax", time: "32 min" },
      { type: "video", title: "State Management with Hooks", time: "48 min" },
    ],
  },
  {
    id: "module3",
    title: "Node.js & Server Development",
    meta: "15 lessons • 8h 20m",
    lessons: [
      { type: "video", title: "Express.js Server Setup", time: "25 min" },
      { type: "text", title: "Building RESTful APIs", time: "55 min" },
    ],
  },
];

const defaultReviews = [
  {
    name: "Jessica Chen",
    avatar: "/assets/img/person/person-f-12.webp",
    rating: 5,
    date: "2 weeks ago",
    text: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. The instructor explains complex concepts very clearly.",
  },
  {
    name: "David Thompson",
    avatar: "/assets/img/person/person-m-5.webp",
    rating: 4,
    date: "1 month ago",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Great practical examples and real-world projects that helped me understand the concepts better.",
  },
];

const defaultHighlights = [
  { icon: "bi bi-trophy", label: "Certificate included" },
  { icon: "bi bi-clock-history", label: "45 hours content" },
  { icon: "bi bi-download", label: "Downloadable resources" },
  { icon: "bi bi-infinity", label: "Lifetime access" },
  { icon: "bi bi-phone", label: "Mobile access" },
];

const defaultDetailGrid = {
  Duration: "16 weeks",
  "Skill Level": "Intermediate",
  Language: "English",
  Quizzes: "24",
  Assignments: "8 projects",
  Updated: "December 2024",
};

const PLAN_PRIORITY = {
  free: 0,
  plus: 1,
  business: 2,
  enterprise: 3,
};

const PLAN_LABELS = {
  plus: "Plus",
  business: "Business",
  enterprise: "Enterprise",
};

const formatPlanLabel = (plan) => PLAN_LABELS[plan] || plan?.toUpperCase();

export default function CourseDetails() {
  const { slug: slugParam } = useParams(); // lấy slug từ URL path
  const [searchParams] = useSearchParams();
  const slug = slugParam || searchParams.get("slug"); // fallback cho các link cũ
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCourse = async () => {
      if (!slug) {
        console.warn("Missing course slug. Unable to fetch course details.");
        setLoading(false);
        return;
      }
      try {
        const res = await getCourseDetails(slug); // api call
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  useEffect(() => {
    let ignore = false;
    const checkEnrollment = async () => {
      if (!user || !course?._id) return;
      setCheckingAccess(true);
      try {
        const { data } = await getMyEnrollments();
        if (ignore) return;
        const matched = data.some(
          (enrollment) =>
            enrollment.course?._id === course._id || enrollment.course?.slug === course.slug
        );
        setEnrolled(matched);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setCheckingAccess(false);
      }
    };
    checkEnrollment();
    return () => {
      ignore = true;
    };
  }, [user, course]);

  const derived = useMemo(() => {
    if (!course) {
      return {};
    }

    const skills = Array.isArray(course.skills) && course.skills.length
      ? course.skills.map((skill) => ({
        title: skill.title || skill,
        details: skill.details || skill.description || "",
        icon: skill.icon || "bi bi-check2-circle",
      }))
      : defaultSkills;

    const requirements = Array.isArray(course.requirements) && course.requirements.length
      ? course.requirements
      : defaultRequirements;

    const curriculum = Array.isArray(course.curriculum) && course.curriculum.length
      ? course.curriculum
      : defaultCurriculum;

    const reviews = Array.isArray(course.reviews) && course.reviews.length
      ? course.reviews
      : defaultReviews;

    const highlights = Array.isArray(course.highlights) && course.highlights.length
      ? course.highlights
      : defaultHighlights;

    const detailGrid = {
      ...defaultDetailGrid,
      ...(course.details || {}),
    };

    const rating = course.rating || 4.8;
    const reviewCount = course.reviewCount || 1247;

    return {
      skills,
      requirements,
      curriculum,
      reviews,
      highlights,
      detailGrid,
      rating,
      reviewCount,
    };
  }, [course]);

  if (loading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found</p>;

  const {
    skills,
    requirements,
    curriculum,
    reviews,
    highlights,
    detailGrid,
    rating,
    reviewCount,
  } = derived;

  const category = course.category || "Web Development";
  const level = course.level || "Beginner";
  const heroImage = getImageUrl(course.image) || "/assets/img/education/courses-8.webp";
  const instructor = course.instructor;
  const formattedPrice = course.price === 0 ? "Free" : `${course.price.toLocaleString("vi-VN")}đ`;
  const originalPriceValue = course.price ? Math.round(course.price * 1.3) : 0;
  const formattedOriginalPrice =
    course.price === 0 ? "" : `${originalPriceValue.toLocaleString("vi-VN")}đ`;
  const discountPercent =
    course.price && originalPriceValue
      ? `${Math.round((1 - course.price / originalPriceValue) * 100)}% OFF`
      : "";
  const studentsCount = course.studentsCount || 0;
  const instructorAvatar =
    instructor?.image ||
    instructor?.avatar ||
    "/assets/img/person/person-m-8.webp";
  const instructorRole = instructor?.role || "Instructor";
  const durationLabel = course.durationHours ? formatDuration(course.durationHours) : detailGrid.Duration || "—";
  detailGrid.Duration = durationLabel;
  const availablePlans = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
  const lowestPlanPriority = availablePlans.length
    ? Math.min(
        ...availablePlans.map((plan) =>
          Number.isFinite(PLAN_PRIORITY[plan]) ? PLAN_PRIORITY[plan] : Number.POSITIVE_INFINITY
        )
      )
    : Number.POSITIVE_INFINITY;
  const sortedPlanTags = [...availablePlans].sort(
    (a, b) => (PLAN_PRIORITY[a] || 99) - (PLAN_PRIORITY[b] || 99)
  );
  const lowestPlan = sortedPlanTags[0];
  const userPlanRank = PLAN_PRIORITY[user?.plan] ?? 0;
  const hasActivePlan = Boolean(user?.planActive && userPlanRank > 0);
  const unlockByPlan =
    hasActivePlan && lowestPlanPriority !== Number.POSITIVE_INFINITY
      ? userPlanRank >= lowestPlanPriority
      : false;
  const isFreeCourse = (course.price ?? 0) === 0 && course.allowIndividualPurchase !== false;
  const isUnlocked = enrolled || unlockByPlan || isFreeCourse;
  const requiresPlanOnly = sortedPlanTags.length > 0 && course.allowIndividualPurchase === false;

  const accessMessage = (() => {
    if (isUnlocked) {
      if (isFreeCourse && !enrolled && !unlockByPlan) {
        return "Khoá học miễn phí, bạn có thể học ngay không cần thanh toán.";
      }
      return "Bạn đã mở khoá toàn bộ nội dung khoá học này.";
    }
    if (requiresPlanOnly && lowestPlan) {
      return `Khoá học chỉ dành cho thành viên gói ${formatPlanLabel(
        lowestPlan
      )} trở lên. Nâng cấp để tiếp tục.`;
    }
    if (sortedPlanTags.length > 0 && !unlockByPlan) {
      if (hasActivePlan) {
        return `Gói hiện tại (${formatPlanLabel(user.plan)}) chưa bao gồm khoá học này. Cần gói ${formatPlanLabel(
          lowestPlan
        )} trở lên hoặc mua lẻ.`;
      }
      return `Khoá học nằm trong gói ${formatPlanLabel(
        lowestPlan
      )}+ hoặc bạn có thể mua lẻ.`;
    }
    return "Thanh toán một lần để mở khoá trọn đời.";
  })();

  const courseSlug = course?.slug || slug;

  const primaryCtaLabel = isUnlocked
    ? "Đi tới bài học"
    : requiresPlanOnly
      ? `Nâng cấp gói ${formatPlanLabel(lowestPlan || "plus")}`
      : "Mua khoá học";

  const primaryCtaHandler = () => {
    if (isUnlocked) {
      if (courseSlug) {
        navigate(`/courses/${courseSlug}/learn`);
      } else {
        navigate("/account?tab=courses");
      }
      return;
    }
    if (requiresPlanOnly) {
      navigate(`/pricing?plan=${lowestPlan || "plus"}`);
      return;
    }
    handleEnrollClick();
  };

  const handleEnrollClick = () => {
    const checkoutTarget = courseSlug || course?._id;
    if (!checkoutTarget) return;
    navigate(`/checkout/${checkoutTarget}`, {
      state: {
        courseId: course?._id,
        courseSlug: course?.slug || courseSlug || slug,
        course,
      },
    });
  };

  const isCurriculumLocked = !isUnlocked;

  return (
    <main className="main course-details-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">{course.title}</h1>
          <nav className="breadcrumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li className="current">Course Details</li>
            </ol>
          </nav>
        </div>
      </div>

      <section id="course-details" className="course-details section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button
              type="button"
              className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left-circle fs-4"></i>
              <span className="fw-semibold">Quay lại</span>
            </button>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="course-hero">
                <div className="hero-content">
                  <div className="course-badge">
                    <span className="category">{category}</span>
                    <span className="level">{level}</span>
                  </div>
                  <h1>{course.title}</h1>
                  <p className="course-subtitle">{course.description}</p>

                  <div className="instructor-card">
                    <img src={instructorAvatar} alt="Instructor" className="instructor-image" />
                    <div className="instructor-details">
                      <h5>{instructor?.name || "Course Instructor"}</h5>
                      <span>{instructorRole}</span>
                      <div className="instructor-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${star <= Math.floor(rating)
                                ? "bi-star-fill"
                                : star - rating === 0.5
                                  ? "bi-star-half"
                                  : "bi-star"
                              }`}
                          ></i>
                        ))}
                        <span>
                          {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hero-meta mt-3">
                    <span><i className="bi bi-clock-history me-1"></i>{durationLabel}</span>
                    <span><i className="bi bi-people me-1"></i>{studentsCount.toLocaleString()} học viên</span>
                  </div>
                </div>
                {sortedPlanTags.length > 0 && (
                  <div className="plan-tags mt-3">
                    {sortedPlanTags.map((plan) => (
                      <span className={`plan-tag plan-${plan}`} key={plan}>
                        #{formatPlanLabel(plan)}
                      </span>
                    ))}
                    {requiresPlanOnly && <span className="plan-tag badge-only">Plan only</span>}
                  </div>
                )}
                <div className="hero-image">
                  <iframe
                    width="100%"
                    height="360"
                    src={course.previewVideo}
                    title="Course Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

              </div>

              <div className="course-nav-tabs">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <button className="nav-link active" id="course-detailsoverview-tab" data-bs-toggle="tab" data-bs-target="#course-detailsoverview" type="button" role="tab">
                      <i className="bi bi-layout-text-window-reverse"></i>
                      Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" id="course-detailscurriculum-tab" data-bs-toggle="tab" data-bs-target="#course-detailscurriculum" type="button" role="tab">
                      <i className="bi bi-list-ul"></i>
                      Curriculum
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" id="course-detailsinfo-tab" data-bs-toggle="tab" data-bs-target="#course-detailsinfo" type="button" role="tab">
                      <i className="bi bi-info-circle"></i>
                      Details
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" id="course-detailsreviews-tab" data-bs-toggle="tab" data-bs-target="#course-detailsreviews" type="button" role="tab">
                      <i className="bi bi-star"></i>
                      Reviews
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="course-detailsoverview" role="tabpanel">
                    <div className="overview-section">
                      <h3>Course Description</h3>
                      <p>{course.longDescription || course.description}</p>
                      {course.summary && <p>{course.summary}</p>}
                    </div>

                  <div className="tab-pane fade" id="course-detailsinfo" role="tabpanel">
                    <h3>Course Details</h3>
                    <div className="detail-grid">
                      {Object.entries(detailGrid).map(([label, value]) => (
                        <div className="detail-row" key={label}>
                          <span className="detail-label">{label}</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                    <div className="skills-grid">
                      <h3>Skills You'll Gain</h3>
                      <div className="row">
                        {skills.map((skill, idx) => (
                          <div className="col-md-6" key={idx}>
                            <div className="skill-item">
                              <div className="skill-icon">
                                <i className={skill.icon}></i>
                              </div>
                              <div className="skill-content">
                                <h5>{skill.title}</h5>
                                <p>{skill.details}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="requirements-section">
                      <h3>Requirements</h3>
                      <ul className="requirements-list">
                        {requirements.map((req, idx) => (
                          <li key={idx}>
                            <i className="bi bi-check2"></i>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="course-detailscurriculum" role="tabpanel">
                    {isCurriculumLocked ? (
                      <div className="curriculum-locked text-center p-5 border rounded-4 shadow-sm">
                        <div className="mb-3">
                          <i className="bi bi-lock-fill fs-1 text-primary"></i>
                        </div>
                        <h3 className="h4 mb-3">Nội dung chi tiết đã được khoá</h3>
                        <p className="text-muted mb-4">
                          Mua khoá học hoặc đăng ký gói phù hợp để mở toàn bộ giáo trình, video và tài liệu đính kèm.
                        </p>
                        <div className="d-flex flex-wrap gap-3 justify-content-center">
                          <button className="btn btn-primary" onClick={primaryCtaHandler} disabled={checkingAccess}>
                            {checkingAccess ? "Đang kiểm tra..." : primaryCtaLabel}
                          </button>
                          {!requiresPlanOnly && (
                            <Link className="btn btn-outline-secondary" to="#course-detailsinfo">
                              Xem thông tin khoá học
                            </Link>
                          )}
                        </div>
                        {sortedPlanTags.length > 0 && (
                          <p className="text-muted small mt-3 mb-0">
                            Khoá học nằm trong gói {formatPlanLabel(lowestPlan || "plus")}+.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="curriculum-overview">
                          <div className="curriculum-stats">
                            <div className="stat">
                              <i className="bi bi-collection-play"></i>
                              <span>{curriculum.length} Sections</span>
                            </div>
                            <div className="stat">
                              <i className="bi bi-play-circle"></i>
                              <span>
                                {curriculum.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)} Lectures
                              </span>
                            </div>
                            <div className="stat">
                              <i className="bi bi-clock"></i>
                              <span>{detailGrid.Duration || "45h 32m"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="accordion" id="curriculumAccordion">
                          {curriculum.map((module, index) => {
                            const moduleId = module.id || `module-${index}`;
                            return (
                              <div className="accordion-item curriculum-module" key={moduleId}>
                                <h2 className="accordion-header">
                                  <button
                                    className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#${moduleId}`}
                                  >
                                    <div className="module-info">
                                      <span className="module-title">{module.title}</span>
                                      <span className="module-meta">{module.meta}</span>
                                    </div>
                                  </button>
                                </h2>
                                <div
                                  id={moduleId}
                                  className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                  data-bs-parent="#curriculumAccordion"
                                >
                                  <div className="accordion-body">
                                    <div className="lessons-list">
                                      {module.lessons?.map((lesson, lessonIdx) => (
                                        <div className="lesson" key={lessonIdx}>
                                          <i
                                            className={`bi ${lesson.type === "text"
                                                ? "bi-file-earmark-text"
                                                : "bi-play-circle"
                                              }`}
                                          ></i>
                                          <span className="lesson-title">{lesson.title}</span>
                                          {lesson.time && (
                                            <span className="lesson-time">{lesson.time}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="tab-pane fade" id="course-detailsreviews" role="tabpanel">
                    <div className="reviews-summary">
                      <div className="rating-overview">
                        <div className="overall-rating">
                          <div className="rating-number">{rating.toFixed(1)}</div>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`bi ${star <= Math.floor(rating)
                                    ? "bi-star-fill"
                                    : star - rating === 0.5
                                      ? "bi-star-half"
                                      : "bi-star"
                                  }`}
                              ></i>
                            ))}
                          </div>
                          <div className="rating-text">{reviewCount.toLocaleString()} reviews</div>
                        </div>
                      </div>
                    </div>

                    <div className="reviews-list">
                      {reviews.map((review, idx) => (
                        <div className="review-item" key={idx}>
                          <div className="reviewer-info">
                            <img
                              src={review.avatar || "/assets/img/person/person-f-12.webp"}
                              alt={review.name}
                              className="reviewer-avatar"
                            />
                            <div className="reviewer-details">
                              <h6>{review.name}</h6>
                              <div className="review-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`bi ${star <= review.rating ? "bi-star-fill" : "bi-star"}`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <span className="review-date">{review.date}</span>
                          </div>
                          <p className="review-text">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
                <div className="course-sidebar">
                <div className="course-pay-card">
                <div className="card-header">
                  <div className="price-display">
                    <span className="current-price">{formattedPrice}</span>
                    {formattedOriginalPrice && (
                      <>
                        <span className="original-price">{formattedOriginalPrice}</span>
                        <span className="discount">{discountPercent}</span>
                      </>
                    )}
                  </div>
                  <div className="enrollment-count">
                    <i className="bi bi-people"></i>
                    <span>{studentsCount.toLocaleString()} students enrolled</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="access-status">
                    <i className={`bi ${isUnlocked ? "bi-unlock" : "bi-lock"}`}></i>
                    <div>
                      <strong>{isUnlocked ? "Đã mở khoá" : "Chưa mở khoá"}</strong>
                      <p>{accessMessage}</p>
                    </div>
                  </div>

                  <div className="course-highlights">
                    {highlights.map((highlight, idx) => (
                      <div className="highlight-item" key={idx}>
                        <i className={highlight.icon}></i>
                        <span>{highlight.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-primary"
                      onClick={primaryCtaHandler}
                      disabled={checkingAccess}
                    >
                      {checkingAccess ? "Đang kiểm tra..." : primaryCtaLabel}
                    </button>
                    {!isUnlocked && sortedPlanTags.length > 0 && course.allowIndividualPurchase !== false && (
                      <Link className="btn-secondary" to={`/pricing?plan=${lowestPlan || "plus"}`}>
                        Xem gói {formatPlanLabel(lowestPlan || "plus")}
                      </Link>
                    )}
                  </div>

                  <div className="guarantee">
                    <i className="bi bi-shield-check"></i>
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
