import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getCourses, getMyEnrollments, getImageUrl } from "../api";
import { useAuth } from "../context/AuthContext";

const DURATION_BUCKETS = {
  under5: (hours) => typeof hours === "number" && hours < 5,
  "5to20": (hours) => typeof hours === "number" && hours >= 5 && hours <= 20,
  "20plus": (hours) => typeof hours === "number" && hours > 20,
};

const PLAN_LABELS = {
  plus: "Plus",
  business: "Business",
  enterprise: "Enterprise", 
};

const parseDurationHours = (course) => {
  if (!course) return null;
  if (typeof course.durationHours === "number") return course.durationHours;
  const raw =
    course.details?.Duration ||
    course.duration ||
    course.curriculum?.[0]?.meta ||
    "";
  if (!raw) return null;
  const lower = String(raw).toLowerCase();
  const match = lower.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  if (Number.isNaN(value)) return null;
  if (lower.includes("week")) {
    return value * 5; // assume 5 study hours per week
  }
  if (lower.includes("day")) {
    return value * 24;
  }
  if (lower.includes("hour") || lower.includes("hours") || lower.includes("h")) {
    return value;
  }
  if (lower.includes("minute") || lower.includes("min")) {
    return value / 60;
  }
  return value;
};

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [levelFilters, setLevelFilters] = useState(["all"]);
  const [durationFilters, setDurationFilters] = useState([]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [planFilters, setPlanFilters] = useState([]);
  const [ownedCourses, setOwnedCourses] = useState({ ids: new Set(), slugs: new Set() });
  const [loadingOwned, setLoadingOwned] = useState(false);
  const [showPurchasedOnly, setShowPurchasedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, levelFilters, durationFilters, priceFilters, planFilters, showPurchasedOnly]);

  const handlePageChange = (newPageOrUpdater) => {
    setCurrentPage(newPageOrUpdater);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    AOS.init({ duration: 700, once: true });

    let mounted = true;
    getCourses()
      .then((res) => {
        if (mounted) {
          setCourses(res.data || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setOwnedCourses({ ids: new Set(), slugs: new Set() });
      setShowPurchasedOnly(false);
      return undefined;
    }

    const fetchOwned = async () => {
      setLoadingOwned(true);
      try {
        const { data } = await getMyEnrollments();
        if (ignore) return;
        const ids = new Set();
        const slugs = new Set();
        (data || []).forEach((enrollment) => {
          const courseId = enrollment.course?._id || enrollment.courseId || enrollment.course;
          if (courseId) ids.add(String(courseId));
          const courseSlug = enrollment.course?.slug;
          if (courseSlug) slugs.add(courseSlug);
        });
        setOwnedCourses({ ids, slugs });
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setOwnedCourses({ ids: new Set(), slugs: new Set() });
        }
      } finally {
        if (!ignore) setLoadingOwned(false);
      }
    };

    fetchOwned();
    return () => {
      ignore = true;
    };
  }, [user]);

  const categories = useMemo(() => {
    if (!courses.length) return [];

    const counts = courses.reduce((acc, course) => {
      const key = course.category || "Khác";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [courses]);

  const toggleLevel = useCallback((value) => {
    setLevelFilters((prev) => {
      if (value === "all") {
        return ["all"];
      }
      const withoutAll = prev.filter((item) => item !== "all");
      if (withoutAll.includes(value)) {
        const next = withoutAll.filter((item) => item !== value);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, value];
    });
  }, []);

  const toggleDuration = useCallback((value) => {
    setDurationFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const togglePrice = useCallback((value) => {
    setPriceFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const togglePlan = useCallback((value) => {
    setPlanFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return courses.filter((course) => {
      const courseId = course?._id ? String(course._id) : null;
      const matchesOwnership =
        !showPurchasedOnly ||
        (courseId && ownedCourses.ids.has(courseId)) ||
        (course.slug && ownedCourses.slugs.has(course.slug));
      if (!matchesOwnership) return false;

      const matchesCategory =
        selectedCategory === "all" ||
        (course.category || "Khác").toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      const matchesLevel =
        levelFilters.includes("all") || levelFilters.includes(course.level);
      if (!matchesLevel) return false;

      const durationHours = parseDurationHours(course);
      const matchesDuration =
        !durationFilters.length ||
        durationFilters.some((bucket) => DURATION_BUCKETS[bucket]?.(durationHours));
      if (!matchesDuration) return false;

      const matchesPrice =
        !priceFilters.length ||
        priceFilters.some((bucket) => {
          if (bucket === "free") return course.price === 0;
          if (bucket === "paid") return course.price > 0;
          return true;
        });
      if (!matchesPrice) return false;

      const matchesPlan =
        !planFilters.length ||
        planFilters.some((plan) => (course.availableInPlans || []).includes(plan));
      if (!matchesPlan) return false;

      if (!keyword) return true;

      const haystack = [
        course.title,
        course.description,
        course.category,
        course.level,
        course.instructor?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return keyword.split(/\s+/).every((fragment) => haystack.includes(fragment));
    });
  }, [
    courses,
    searchTerm,
    selectedCategory,
    levelFilters,
    durationFilters,
    priceFilters,
    planFilters,
    showPurchasedOnly,
    ownedCourses,
  ]);

  const ownedCourseCount = ownedCourses.ids.size || ownedCourses.slugs.size;
  const ownedFilterDisabled = !user || (!loadingOwned && ownedCourseCount === 0);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <main className="main courses-page">

      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Khóa học tiếng Anh</h1>

          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Trang chủ</Link></li>
              <li className="current">Khóa học tiếng Anh</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Courses Section */}
      <section id="courses-2" className="courses-2 section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">

            {/* FILTERS LEFT */}
            <div className="col-lg-3">
              <div className="course-filters" data-aos="fade-right" data-aos-delay="100">

                <h4 className="filter-title">Lọc khóa học tiếng Anh</h4>

                {/* CATEGORY */}
                <div className="filter-group">
                  <h5>Chủ đề</h5>
                  <div className="filter-options category-options">
                    <label className="filter-checkbox">
                      <input
                        type="radio"
                        name="course-category"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                      />
                      <span className="checkmark"></span>
                      Tất cả ({courses.length})
                    </label>
                    {categories.map((category) => (
                      <label className="filter-checkbox" key={category.name}>
                        <input
                          type="radio"
                          name="course-category"
                          checked={selectedCategory === category.name}
                          onChange={() => setSelectedCategory(category.name)}
                        />
                        <span className="checkmark"></span>
                        {category.name} ({category.total})
                      </label>
                    ))}
                  </div>
                </div>

                {/* LEVEL */}
                <div className="filter-group">
                  <h5>Trình độ</h5>
                  <div className="filter-options">

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("all")}
                        onChange={() => toggleLevel("all")}
                      />
                      <span className="checkmark"></span>
                      Tất cả trình độ
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Beginner")}
                        onChange={() => toggleLevel("Beginner")}
                      />
                      <span className="checkmark"></span>
                      Beginner
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Intermediate")}
                        onChange={() => toggleLevel("Intermediate")}
                      />
                      <span className="checkmark"></span>
                      Intermediate
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Advanced")}
                        onChange={() => toggleLevel("Advanced")}
                      />
                      <span className="checkmark"></span>
                      Advanced
                    </label>

                  </div>
                </div>

                {/* DURATION */}
                <div className="filter-group">
                  <h5>Thời lượng</h5>
                  <div className="filter-options">

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={durationFilters.includes("under5")}
                        onChange={() => toggleDuration("under5")}
                      />
                      <span className="checkmark"></span>
                      Dưới 5 giờ
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={durationFilters.includes("5to20")}
                        onChange={() => toggleDuration("5to20")}
                      />
                      <span className="checkmark"></span>
                      5–20 giờ
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={durationFilters.includes("20plus")}
                        onChange={() => toggleDuration("20plus")}
                      />
                      <span className="checkmark"></span>
                      Trên 20 giờ
                    </label>

                  </div>
                </div>

                {/* PRICE */}
                <div className="filter-group">
                  <h5>Học phí</h5>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={priceFilters.includes("free")}
                        onChange={() => togglePrice("free")}
                      />
                      <span className="checkmark"></span>
                      Miễn phí
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={priceFilters.includes("paid")}
                        onChange={() => togglePrice("paid")}
                      />
                      <span className="checkmark"></span>
                      Có phí
                    </label>
                  </div>
                </div>

                {/* PLAN */}
                <div className="filter-group">
                  <h5>Gói học</h5>
                  <div className="filter-options">
                    {["plus", "business", "enterprise"].map((plan) => (
                      <label className="filter-checkbox" key={plan}>
                        <input
                          type="checkbox"
                          checked={planFilters.includes(plan)}
                          onChange={() => togglePlan(plan)}
                        />
                        <span className="checkmark"></span>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="col-lg-9">

              {/* Search + Sort */}
              <div className="courses-header" data-aos="fade-left" data-aos-delay="100">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Tìm theo tên khóa học hoặc từ khóa..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="header-actions d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className={`btn ${
                      showPurchasedOnly ? "btn-primary" : "btn-outline-primary"
                    } d-flex align-items-center gap-2`}
                    onClick={() => !ownedFilterDisabled && setShowPurchasedOnly((prev) => !prev)}
                    disabled={ownedFilterDisabled}
                  >
                    <i className="bi bi-journal-check"></i>
                    {showPurchasedOnly ? "Đang lọc khóa đã mua" : "Khóa đã mua"}
                    {loadingOwned && (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    )}
                  </button>
                  <div className="sort-dropdown">
                    <select>
                      <option>Sort by: Most Popular</option>
                      <option>Newest First</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Duration: Short to Long</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* COURSES GRID */}
              <div className="courses-grid" data-aos="fade-up" data-aos-delay="200">
                <div className="row">

                  {loading && (
                    <div className="col-12">
                      <p>Đang tải danh sách khóa học...</p>
                    </div>
                  )}

                  {!loading && filteredCourses.length === 0 && (
                    <div className="col-12">
                      <div className="empty-state">
                        <h4>Không tìm thấy khóa học phù hợp</h4>
                        <p>Thử đổi từ khóa hoặc chọn danh mục khác nhé.</p>
                        <button className="btn btn-outline-primary mt-2" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                          Xóa bộ lọc
                        </button>
                      </div>
                    </div>
                  )}

                  {currentCourses.map((course) => {
                    const planTags = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
                    const checkoutTarget = course.slug || course._id;
                    const courseId = course?._id ? String(course._id) : null;
                    const isOwned =
                      (courseId && ownedCourses.ids.has(courseId)) ||
                      (course.slug && ownedCourses.slugs.has(course.slug));
                    return (
                    <div className="col-lg-6 col-md-6" key={course._id}>
                      <div className="course-card">

                        <div className="course-image">
                          <img
                            src={getImageUrl(course.image) || "/assets/img/education/courses-3.webp"}
                            className="img-fluid"
                            alt={course.title}
                            onError={(e) => {
                              e.target.src = "/assets/img/education/courses-3.webp";
                            }}
                          />

                          {course.featured && (
                            <div className="course-badge">Featured</div>
                          )}

                          <div className="course-price">
                            {course.price === 0 ? "Free" : course.price.toLocaleString() + "đ"}
                          </div>
                        </div>

                        <div className="course-content">
                          <div className="course-meta">
                            <span className="category">{course.category || "General"}</span>
                            <span className="level">{course.level}</span>
                          </div>

                          <h3>{course.title}</h3>
                          <p>{course.description}</p>

                          {planTags.length > 0 && (
                            <div className="plan-tags">
                              {planTags.map((plan) => (
                                <span className={`plan-tag plan-${plan}`} key={plan}>
                                  #{PLAN_LABELS[plan] || plan}
                                </span>
                              ))}
                              {course.allowIndividualPurchase === false && (
                                <span className="plan-tag badge-only">Plan only</span>
                              )}
                            </div>
                          )}

                          {/* DETAILS */}
                          <Link
                            to={`/courses/${course.slug}`}
                            className="btn-course"
                          >
                            View Details
                          </Link>
                          {isOwned ? (
                            <Link
                              to={`/courses/${course.slug}/learn`}
                              className="btn btn-success w-100 mt-2"
                            >
                              Tiếp tục học
                            </Link>
                          ) : checkoutTarget ? (
                            <Link
                              to={`/checkout/${checkoutTarget}`}
                              state={{ courseId: course._id, courseSlug: course.slug, course }}
                              className="btn btn-outline-primary w-100 mt-2"
                            >
                              Đăng ký ngay
                            </Link>
                          ) : (
                            <button className="btn btn-outline-secondary w-100 mt-2" type="button" disabled>
                              Đang cập nhật
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })}

                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-wrapper" data-aos="fade-up" data-aos-delay="300">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(prev => Math.max(prev - 1, 1))}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li className={`page-item ${page === currentPage ? 'active' : ''}`} key={page}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(prev => Math.min(prev + 1, totalPages))}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
