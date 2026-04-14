import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="footer accent-background">

      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-5 col-md-12 footer-about">
            <Link to="/" className="logo d-flex align-items-center">
              <span className="sitename">EngSpace</span>
            </Link>
            <p>Nền tảng học tiếng Anh trực tuyến với lộ trình rõ ràng, bài học thực chiến và không gian tự học dễ dàng theo dõi.</p>
            <div className="social-links d-flex mt-4">
              <a href="#"><i className="bi bi-twitter-x"></i></a>
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-6 footer-links">
            <h4>Khám phá</h4>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/courses">Khóa học</Link></li>
              <li><Link to="/pricing">Học phí</Link></li>
              <li><Link to="/blog">Bài viết</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-6 footer-links">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><Link to="/quiz">Quiz</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/terms">Điều khoản</Link></li>
              <li><Link to="/privacy">Chính sách</Link></li>
              <li><Link to="/account">Tài khoản</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-12 footer-contact text-center text-md-start">
            <h4>Liên hệ</h4>
            <p>EngSpace Learning Hub</p>
            <p>Đồng hành cùng học viên mỗi ngày</p>
            <p>Online toàn quốc</p>
            <p className="mt-4"><strong>Phone:</strong> <span>+84 987 654 321</span></p>
            <p><strong>Email:</strong> <span>hello@engspace.vn</span></p>
          </div>

        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Learner</strong> <span>All Rights Reserved</span></p>
        <p className="brand-copy">Copyright <strong className="px-1 sitename">EngSpace</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Learning platform for modern English learners.
        </div>
      </div>

    </footer>
  );
}


