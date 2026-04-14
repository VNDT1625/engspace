import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../assets/css/reading-custom.css';
import api from '../api';

export default function ReadingList() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilters, setLevelFilters] = useState(['all']);
  
  // Modal States
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedMode, setSelectedMode] = useState('practice'); // 'practice' or 'exam'

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    AOS.init({ duration: 700, once: true });

    const fetchReadings = async () => {
      try {
        const res = await api.get('/readings');
        setReadings(res.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách bài đọc", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilters]);

  const handlePageChange = (newPageOrUpdater) => {
    setCurrentPage(newPageOrUpdater);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLevel = useCallback((value) => {
    setLevelFilters((prev) => {
      if (value === "all") return ["all"];
      const withoutAll = prev.filter((item) => item !== "all");
      if (withoutAll.includes(value)) {
        const next = withoutAll.filter((item) => item !== value);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, value];
    });
  }, []);

  const filteredReadings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    
    return readings.filter(r => {
      // 1. Difficulty Filter
      const backendDiff = r.difficulty || ""; 
      // Mapping logic just in case backend uses English
      const diffMap = {
        "easy": "Dễ",
        "medium": "Trung bình",
        "hard": "Khó"
      };
      
      const mappedDiff = diffMap[backendDiff.toLowerCase()] || backendDiff;
      
      const matchesLevel = levelFilters.includes("all") || 
        levelFilters.some(filterValue => {
            if(filterValue === 'Easy') return mappedDiff === 'Dễ' || backendDiff.toLowerCase() === 'easy';
            if(filterValue === 'Medium') return mappedDiff === 'Trung bình' || backendDiff.toLowerCase() === 'medium';
            if(filterValue === 'Hard') return mappedDiff === 'Khó' || backendDiff.toLowerCase() === 'hard';
            return false;
        });

      if (!matchesLevel) return false;

      // 2. Search Box Filter
      if (keyword) {
        const haystack = [r.title, r.description, r.difficulty].filter(Boolean).join(" ").toLowerCase();
        if (!keyword.split(/\s+/).every(frag => haystack.includes(frag))) {
          return false;
        }
      }

      return true;
    });
  }, [readings, searchTerm, levelFilters]);

  // Derived Pagination Data
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReadings = filteredReadings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <main className="main courses-page">
      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">IELTS Reading Practice</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Trang chủ</Link></li>
              <li className="current">Luyện Đọc</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Section */}
      <section id="readings-list" className="courses-2 section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">
            
            {/* FILTERS LEFT */}
            <div className="col-lg-3">
              <div className="course-filters" data-aos="fade-right" data-aos-delay="100">
                <h4 className="filter-title">Lọc bài đọc</h4>

                {/* LEVEL FILTER */}
                <div className="filter-group">
                  <h5>Độ khó</h5>
                  <div className="filter-options">
                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("all")}
                        onChange={() => toggleLevel("all")}
                      />
                      <span className="checkmark"></span>
                      Tất cả
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Easy")}
                        onChange={() => toggleLevel("Easy")}
                      />
                      <span className="checkmark"></span>
                      Dễ
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Medium")}
                        onChange={() => toggleLevel("Medium")}
                      />
                      <span className="checkmark"></span>
                      Trung bình
                    </label>

                    <label className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={levelFilters.includes("Hard")}
                        onChange={() => toggleLevel("Hard")}
                      />
                      <span className="checkmark"></span>
                      Khó
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="col-lg-9">
              {/* Search + Sort Header */}
              <div className="courses-header" data-aos="fade-left" data-aos-delay="100">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Tìm theo tiêu đề bài đọc..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              {/* READINGS GRID */}
              <div className="courses-grid" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  {loading && (
                    <div className="col-12">
                      <p>Đang tải danh sách bài tập...</p>
                    </div>
                  )}

                  {!loading && filteredReadings.length === 0 && (
                    <div className="col-12">
                      <div className="empty-state">
                        <h4>Không tìm thấy bài đọc phù hợp</h4>
                        <p>Thử đổi từ khóa hoặc chọn độ khó khác nhé.</p>
                        <button className="btn btn-outline-primary mt-2" onClick={() => { setSearchTerm(""); setLevelFilters(["all"]); }}>
                          Xóa bộ lọc
                        </button>
                      </div>
                    </div>
                  )}

                  {currentReadings.map((item) => (
                    <div className="col-lg-6 col-md-6" key={item._id}>
                      <div className="course-card">
                        
                        <div className="course-image">
                          <img
                            src={item.thumbnail || "/assets/img/reading-default.webp"}
                            alt={item.title}
                            className="img-fluid"
                            onError={(e) => { e.target.src = "/assets/img/education/courses-3.webp"; }}
                          />
                          <div className="course-badge">
                            {item.difficulty === 'Easy' ? 'Dễ' : item.difficulty === 'Medium' ? 'Trung bình' : item.difficulty === 'Hard' ? 'Khó' : item.difficulty}
                          </div>
                        </div>

                        <div className="course-content">
                          <div className="course-meta">
                            <span className="duration">
                              <i className="bi bi-clock me-1"></i> {item.timeLimit} phút
                            </span>
                            <span className="level">
                              <i className="bi bi-question-circle me-1"></i> {item.totalQuestions} câu hỏi
                            </span>
                          </div>

                          <h3>{item.title}</h3>
                          <p>{item.description || "Luyện tập kỹ năng tìm kiếm thông tin và quản lý thời gian hiệu quả hơn."}</p>

                          <button
                            className="btn btn-primary w-100 mt-3 d-block"
                            onClick={() => {
                              setSelectedReading(item);
                              setSelectedMode('practice'); // default
                            }}
                          >
                            Bắt đầu làm bài
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
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

      {/* READING MODE SELECTION MODAL */}
      {selectedReading && (
        <div className="reading-modal-overlay" onClick={() => setSelectedReading(null)}>
          <div className="reading-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reading-modal-header">
              <h3>Chọn giao diện làm bài</h3>
              <button className="close-btn" onClick={() => setSelectedReading(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="reading-modal-body">
              <div className="mode-cards-container">
                {/* Exam Mode */}
                <div 
                  className={`mode-card ${selectedMode === 'exam' ? 'selected' : ''}`}
                  onClick={() => setSelectedMode('exam')}
                >
                  <div className="exam-badge">Giống 100%</div>
                  <div className="mock-ui-box">
                    <i className="bi bi-display"></i>
                  </div>
                  <h4>Giao diện như Thi thật</h4>
                  <p>Mô phỏng 100% giao diện thi máy, giúp các bạn quen với chức năng khi thi thật.</p>
                </div>

                {/* Practice Mode */}
                <div 
                  className={`mode-card ${selectedMode === 'practice' ? 'selected' : ''}`}
                  onClick={() => setSelectedMode('practice')}
                >
                  <div className="mock-ui-box">
                    <i className="bi bi-laptop"></i>
                  </div>
                  <h4>Giao diện Luyện tập</h4>
                  <p>Hỗ trợ tối đa các chức năng: Tra từ vựng, gợi ý viết bài,... Phù hợp để luyện tập.</p>
                </div>
              </div>

              <div className="reading-modal-footer">
                <button 
                  className="btn btn-primary btn-lg px-5 fw-bold rounded-pill"
                  onClick={() => {
                    navigate(`/readinglist/${selectedReading.slug}?mode=${selectedMode}`);
                  }}
                >
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}