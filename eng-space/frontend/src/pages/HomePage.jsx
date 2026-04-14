import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getCourses, getImageUrl } from '../api';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      try {
        const { data } = await getCourses();
        if (!ignore) setCourses(data || []);
      } catch (err) {
        console.error(err);
        if (!ignore) setCoursesError('Không thể tải danh sách khóa học.');
      } finally {
        if (!ignore) setLoadingCourses(false);
      }
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, []);

  const featuredCourses = useMemo(() => {
    if (!courses.length) return [];
    // Lấy ngẫu nhiên tối đa 3 khóa học từ danh sách
    const shuffled = [...courses].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [courses]);

  return (
    <main className="main">
      {/* Courses Hero Section */}
      <section id="courses-hero" className="courses-hero section light-background">
        <div className="hero-content">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
                <div className="hero-text">
                  <h1>Lộ trình rõ ràng, nội dung thực tế, đạt đến mục tiêu.</h1>
                  <p>Khám phá hàng ngàn khóa học chất lượng, được thiết kế bởi các chuyên gia hàng đầu.
                    Học theo tốc độ của riêng bạn, nâng cao kỹ năng và phát triển sự nghiệp ở bất cứ đâu.</p>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="number purecounter" data-purecounter-start="0" data-purecounter-end="2911" data-purecounter-duration="2"></span>
                      <span className="label">Học Viên</span>
                    </div>
                    <div className="stat-item">
                      <span className="number purecounter" data-purecounter-start="0" data-purecounter-end="984" data-purecounter-duration="2"></span>
                      <span className="label">Khóa học chuyên sâu</span>
                    </div>
                    <div className="stat-item">
                      <span className="number purecounter" data-purecounter-start="0" data-purecounter-end="95" data-purecounter-duration="2"></span>
                      <span className="label">Tỉ lệ thành công </span>
                    </div>
                  </div>
                  <div className="hero-buttons">
                    <a href="#courses" className="btn btn-primary">Khám phá khóa học</a>
                    <a href="#about" className="btn btn-outline">Tìm hiểu thêm</a>
                  </div>
                  <div className="hero-features">
                    <div className="feature">
                      <i className="bi bi-shield-check"></i>
                      <span>Khóa học có chứng nhận</span>
                    </div>
                    <div className="feature">
                      <i className="bi bi-clock"></i>
                      <span>Truy cập trọn đời</span>
                    </div>
                    <div className="feature">
                      <i className="bi bi-people"></i>
                      <span>Giảng viên chuyên gia</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
                <div className="hero-image">
                  <div className="main-image">
                    <img src="/assets/img/education/courses-13.webp" alt="Online Learning" className="img-fluid" />
                  </div>
                  <div className="floating-cards">
                    <div className="course-card" data-aos="fade-up" data-aos-delay="300">
                      <div className="card-icon">
                        <i className="bi bi-chat-dots"></i>
                      </div>
                      <div className="card-content">
                        <h6>Tiếng Anh giao tiếp</h6>
                        <span>1,345 học viên</span>
                      </div>
                    </div>
                    <div className="course-card" data-aos="fade-up" data-aos-delay="400">
                      <div className="card-icon">
                        <i className="bi bi-book"></i>
                      </div>
                      <div className="card-content">
                        <h6>Luyện thi IELTS</h6>
                        <span>1,890 học viên</span>
                      </div>
                    </div>
                    <div className="course-card" data-aos="fade-up" data-aos-delay="500">
                      <div className="card-icon">
                        <i className="bi bi-translate"></i>
                      </div>
                      <div className="card-content">
                        <h6>Ngữ pháp & Từ vựng</h6>
                        <span>1,200 học viên</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="featured-courses" className="featured-courses section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Khóa học nổi bật</h2>
          <p>Bắt đầu từ những khóa học tiếng Anh phù hợp mục tiêu của bạn.</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {loadingCourses && (
              <div className="col-12 text-center">
                <p>Đang tải các khóa học nổi bật...</p>
              </div>
            )}

            {coursesError && !loadingCourses && (
              <div className="col-12">
                <div className="alert alert-danger">{coursesError}</div>
              </div>
            )}

            {!loadingCourses && !coursesError && featuredCourses.map((course, index) => (
              <div
                className="col-lg-4 col-md-6"
                key={course._id || course.slug || index}
                data-aos="fade-up"
                data-aos-delay={200 + index * 100}
              >
                <div className="course-card">
                  <div className="course-image">
                    <img
                      src={getImageUrl(course.image) || "/assets/img/education/courses-3.webp"}
                      alt={course.title}
                      className="img-fluid"
                      onError={(e) => { e.target.src = "/assets/img/education/courses-3.webp"; }}
                    />
                    {course.featured && <div className="badge featured">Nổi bật</div>}
                    <div className="price-badge">
                      {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()} đ`}
                    </div>
                  </div>
                  <div className="course-content">
                    <div className="course-meta">
                      <span className="level">{course.level}</span>
                      <span className="duration">
                        {course.details?.Duration || `${course.durationHours || 0} giờ`}
                      </span>
                    </div>
                    <h3>
                      <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                    </h3>
                    <p>{course.description}</p>
                    <div className="course-stats">
                      <div className="rating">
                        <i className="bi bi-star-fill"></i>
                        <span>{course.rating?.toFixed?.(1) || "4.5"}</span>
                      </div>
                      <div className="students">
                        <i className="bi bi-people-fill"></i>
                        <span>{(course.studentsCount || 0).toLocaleString()} học viên</span>
                      </div>
                    </div>
                    <Link to={`/courses/${course.slug}`} className="btn-course">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="more-courses text-center" data-aos="fade-up" data-aos-delay="500">
            <Link to="/courses" className="btn-more">Xem tất cả khóa học</Link>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      <section id="recent-blog-posts" className="recent-blog-posts section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Bài viết mới nhất</h2>
          <p>Khám phá những bài viết mới nhất chia sẻ kinh nghiệm học tập và phát triển bản thân</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="card">
                <div className="card-top d-flex align-items-center">
                  <img src="/assets/img/person/person-f-12.webp" alt="Author" className="rounded-circle me-2" />
                  <span className="author-name">Bởi Andy glamer</span>
                  <span className="ms-auto likes"><i className="bi bi-heart"></i> 65</span>
                </div>
                <div className="card-img-wrapper"><img src="/assets/img/blog/blog-post-1.webp" alt="Post" /></div>
                <div className="card-body">
                  <h5 className="card-title"><Link to="/blog-details">Bí quyết học tiếng Anh giao tiếp hiệu quả cho người mới bắt đầu</Link></h5>
                  <p className="card-text">Khám phá các phương pháp học từ vựng và luyện phản xạ tự nhiên giúp bạn tự tin giao tiếp chỉ sau 3 tháng...</p>
                </div>
              </div>
            </div>
            {/* ... other posts ... */}
          </div>
        </div>
      </section>

      {/* Cta Section */}
      <section id="cta" className="cta section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
              <div className="cta-content">
                <h2>Thay đổi tương lai với các khóa học từ chuyên gia</h2>
                <p>Tham gia cùng hàng ngàn học viên thành công đã thăng tiến trong sự nghiệp thông qua nền tảng giáo dục trực tuyến toàn diện của chúng tôi.</p>
                <div className="features-list">
                  <div className="feature-item" data-aos="fade-up" data-aos-delay="300"><i className="bi bi-check-circle-fill"></i><span>20+ giảng viên chuyên gia giàu kinh nghiệm</span></div>
                  <div className="feature-item" data-aos="fade-up" data-aos-delay="350"><i className="bi bi-check-circle-fill"></i><span>Chứng chỉ hoàn thành cho mọi khóa học</span></div>
                  <div className="feature-item" data-aos="fade-up" data-aos-delay="400"><i className="bi bi-check-circle-fill"></i><span>Truy cập khóa học và tài liệu 24/7</span></div>
                  <div className="feature-item" data-aos="fade-up" data-aos-delay="450"><i className="bi bi-check-circle-fill"></i><span>Nhiều bài tập tương tác và dự án thực tế</span></div>
                </div>
                <div className="cta-actions" data-aos="fade-up" data-aos-delay="500">
                  <Link to="/courses" className="btn btn-primary">Khám phá khóa học</Link>
                  <Link to="/enroll" className="btn btn-outline">Đăng ký ngay</Link>
                </div>
                <div className="stats-row" data-aos="fade-up" data-aos-delay="400">
                  <div className="stat-item"><h3><span data-purecounter-start="0" data-purecounter-end="15000" data-purecounter-duration="2" className="purecounter"></span>+</h3><p>Học viên đã đăng ký</p></div>
                  <div className="stat-item"><h3><span data-purecounter-start="0" data-purecounter-end="150" data-purecounter-duration="2" className="purecounter"></span>+</h3><p>Khóa học hiện có</p></div>
                  <div className="stat-item"><h3><span data-purecounter-start="0" data-purecounter-end="98" data-purecounter-duration="2" className="purecounter"></span>%</h3><p>Tỷ lệ thành công</p></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <div className="cta-image">
                <img src="/assets/img/education/courses-4.webp" alt="Nền tảng học trực tuyến" className="img-fluid" />
                <div className="floating-element student-card" data-aos="zoom-in" data-aos-delay="600">
                  <div className="card-content"><i className="bi bi-person-check-fill"></i><div className="text"><span className="number">2,450</span><span className="label">Học viên mới tháng này</span></div></div>
                </div>
                <div className="floating-element course-card" data-aos="zoom-in" data-aos-delay="700">
                  <div className="card-content"><i className="bi bi-play-circle-fill"></i><div className="text"><span className="number">50+</span><span className="label">Giờ học nội dung</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


