import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { submitContactMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Đang gửi yêu cầu..." });
    try {
      await submitContactMessage(formData);
      setStatus({ state: "success", message: "Đã gửi yêu cầu của bạn. Chúng tôi sẽ phản hồi sớm nhất." });
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error) {
      const message = error.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.";
      setStatus({ state: "error", message });
    }
  };

  return (
    <main className="main contact-page">

      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Contact</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li className="current">Contact</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="contact section">

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="contact-main-wrapper">

            {/* Map */}
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d48389.78314118045!2d-74.006138!3d40.710059!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1676961268712!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="contact-content">

              {/* Contact Cards */}
              <div className="contact-cards-container" data-aos="fade-up" data-aos-delay="300">
                <div className="contact-card">
                  <div className="icon-box"><i className="bi bi-geo-alt"></i></div>
                  <div className="contact-text">
                    <h4>Location</h4>
                    <p>8721 Broadway Avenue, New York, NY 10023</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="icon-box"><i className="bi bi-envelope"></i></div>
                  <div className="contact-text">
                    <h4>Email</h4>
                    <p>info@examplecompany.com</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="icon-box"><i className="bi bi-telephone"></i></div>
                  <div className="contact-text">
                    <h4>Call</h4>
                    <p>+1 (212) 555-7890</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="icon-box"><i className="bi bi-clock"></i></div>
                  <div className="contact-text">
                    <h4>Open Hours</h4>
                    <p>Monday-Friday: 9AM - 6PM</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-container" data-aos="fade-up" data-aos-delay="400">
                <h3>Get in Touch</h3>
                <p>
                  Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <form className="php-email-form" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 form-group mt-3 mt-md-0">
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group mt-3">
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mt-3">
                    <textarea
                      className="form-control"
                      name="message"
                      rows="5"
                      placeholder="Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="my-3">
                    {status.state === "loading" && <div className="loading">Đang gửi...</div>}
                    {status.state === "error" && <div className="error-message">{status.message}</div>}
                    {status.state === "success" && <div className="sent-message">{status.message}</div>}
                  </div>

                  <div className="form-submit">
                    <button type="submit" disabled={status.state === "loading"}>
                      {status.state === "loading" ? "Đang gửi..." : "Send Message"}
                    </button>

                    <div className="social-links">
                      <a href="#"><i className="bi bi-twitter"></i></a>
                      <a href="#"><i className="bi bi-facebook"></i></a>
                      <a href="#"><i className="bi bi-instagram"></i></a>
                      <a href="#"><i className="bi bi-linkedin"></i></a>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
