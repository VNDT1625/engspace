import React from "react";

const Privacy = () => {
  return (
    <main className="main privacy-page">

      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Privacy</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Home</a></li>
              <li className="current">Privacy</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Privacy Section */}
      <section id="privacy" className="privacy section">
        <div className="container">

          {/* Header */}
          <div className="privacy-header">
            <div className="header-content">
              <div className="last-updated">Effective Date: February 27, 2025</div>
              <h1>Privacy Policy</h1>
              <p>
                This Privacy Policy describes how we collect, use, process, and disclose your information,
                including personal information, in conjunction with your access to and use of our services.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="privacy-content">

            <div className="content-section">
              <h2>1. Introduction</h2>
              <p>
                When you use our services, you're trusting us with your information. We work hard to protect
                your information and put you in control.
              </p>
            </div>

            <div className="content-section">
              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide</h3>
              <ul>
                <li>Name and contact info</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Communication preferences</li>
              </ul>

              <h3>2.2 Automatic Information</h3>
              <ul>
                <li>Device information</li>
                <li>Log and usage information</li>
                <li>Location if enabled</li>
                <li>Browser type and settings</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>Provide and personalize services</li>
                <li>Process transactions</li>
                <li>Send updates</li>
                <li>Maintain security</li>
                <li>Analyze and improve services</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>4. Sharing & Disclosure</h2>
              <h3>4.1 With Your Consent</h3>
              <p>We share information only with your permission.</p>
              <h3>4.2 For Legal Reasons</h3>
              <p>We may share information to comply with laws or protect users.</p>
            </div>

            <div className="content-section">
              <h2>5. Data Security</h2>
              <ul>
                <li>We encrypt our services using SSL</li>
                <li>Review information collection, storage, and processing practices</li>
                <li>Restrict access to personal information to employees who need it</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>6. Your Rights and Choices</h2>
              <ul>
                <li>Right to access personal information</li>
                <li>Right to correct inaccurate information</li>
                <li>Right to request deletion</li>
                <li>Right to restrict or object to processing</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page.
              </p>
              <p>
                Your continued use of our services after any changes constitutes your acceptance.
              </p>
            </div>

          </div>

          {/* Contact Section */}
          <div className="privacy-contact">
            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our practices, please contact us:</p>
            <div className="contact-details">
              <p><strong>Email:</strong> privacy@example.com</p>
              <p><strong>Address:</strong> 123 Privacy Street, Security City, 12345</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Privacy;
