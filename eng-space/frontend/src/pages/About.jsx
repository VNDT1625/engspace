import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="main about-page">
      
      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">About</h1>

          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li className="current">About</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <img
                src="/assets/img/education/education-square-2.webp"
                alt="About Us"
                className="img-fluid rounded-4"
              />
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="about-content">
                <span className="subtitle">About Us</span>
                <h2>Empowering Future Leaders Through Quality Education</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <div className="stats-row">
                  <div className="stats-item">
                    <span className="count">15</span>
                    <p>Years of Experience</p>
                  </div>
                  <div className="stats-item">
                    <span className="count">200+</span>
                    <p>Expert Instructors</p>
                  </div>
                  <div className="stats-item">
                    <span className="count">50k+</span>
                    <p>Students Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Cards */}
          <div className="row mt-5 pt-4">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>Our Mission</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-eye"></i>
                </div>
                <h3>Our Vision</h3>
                <p>Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-award"></i>
                </div>
                <h3>Our Values</h3>
                <p>Excepteur sint occaecat cupidatat non proident.</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="row mt-5 pt-3 align-items-center">
            <div className="col-lg-6 order-lg-2" data-aos="fade-up" data-aos-delay="300">
              <div className="achievements">
                <span className="subtitle">Why Choose Us</span>
                <h2>Transforming Education for a Better Tomorrow</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>

                <ul className="achievements-list">
                  <li><i className="bi bi-check-circle-fill"></i> Flexible learning options</li>
                  <li><i className="bi bi-check-circle-fill"></i> Expert instructors</li>
                  <li><i className="bi bi-check-circle-fill"></i> Interactive content</li>
                  <li><i className="bi bi-check-circle-fill"></i> Career support</li>
                  <li><i className="bi bi-check-circle-fill"></i> Modern learning platform</li>
                </ul>

                <Link to="/courses" className="btn-explore">
                  Discover More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-6 order-lg-1" data-aos="fade-up" data-aos-delay="200">
              <div className="about-gallery">
                <div className="row g-3">
                  <div className="col-6">
                    <img src="/assets/img/education/education-1.webp" className="img-fluid rounded-3" />
                  </div>
                  <div className="col-6">
                    <img src="/assets/img/education/students-3.webp" className="img-fluid rounded-3" />
                  </div>
                  <div className="col-12 mt-3">
                    <img src="/assets/img/education/campus-8.webp" className="img-fluid rounded-3" />
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
