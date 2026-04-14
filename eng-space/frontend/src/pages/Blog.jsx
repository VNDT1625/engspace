import React from "react";
import { Link } from "react-router-dom";


const Blog = () => {
  return (
    <>
      {/* Header */}
      

      {/* Main Content */}
      <main className="main">

        {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Blog</h1>

          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li className="current">Blog</li>
            </ol>
          </nav>
        </div>
      </div>


        {/* Blog Hero Section */}
        <section id="blog-hero" className="blog-hero section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="blog-grid">

              {/* Featured Post */}
              <article className="blog-item featured" data-aos="fade-up">
                <img src="assets/img/blog/blog-post-3.webp" alt="Blog Image" className="img-fluid" />
                <div className="blog-content">
                  <div className="post-meta">
                    <span className="date">Apr. 14th, 2025</span>
                    <span className="category">Technology</span>
                  </div>
                  <h2 className="post-title">
                    <a href="blog-details.html" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit">Lorem ipsum dolor sit amet, consectetur adipiscing elit</a>
                  </h2>
                </div>
              </article>

              {/* Other Posts */}
              <article className="blog-item" data-aos="fade-up" data-aos-delay="100">
                <img src="assets/img/blog/blog-post-portrait-1.webp" alt="Blog Image" className="img-fluid" />
                <div className="blog-content">
                  <div className="post-meta">
                    <span className="date">Apr. 14th, 2025</span>
                    <span className="category">Security</span>
                  </div>
                  <h3 className="post-title">
                    <a href="blog-details.html" title="Sed do eiusmod tempor incididunt ut labore">Sed do eiusmod tempor incididunt ut labore</a>
                  </h3>
                </div>
              </article>

              {/* Add remaining blog items similarly... */}
            </div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section id="blog-posts" className="blog-posts section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row gy-4">
              {/* Blog Post Items */}
              <div className="col-lg-4">
                <article className="position-relative h-100">
                  <div className="post-img position-relative overflow-hidden">
                    <img src="assets/img/blog/blog-post-1.webp" className="img-fluid" alt="" />
                  </div>
                  <div className="meta d-flex align-items-end">
                    <span className="post-date"><span>12</span>December</span>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person"></i> <span className="ps-2">John Doe</span>
                    </div>
                    <span className="px-3 text-black-50">/</span>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-folder2"></i> <span className="ps-2">Politics</span>
                    </div>
                  </div>
                  <div className="post-content d-flex flex-column">
                    <h3 className="post-title">Dolorum optio tempore voluptas dignissimos</h3>
                    <a href="blog-details.html" className="readmore stretched-link"><span>Read More</span><i className="bi bi-arrow-right"></i></a>
                  </div>
                </article>
              </div>

              {/* Repeat other posts similarly... */}

            </div>
          </div>
        </section>

        {/* Pagination */}
        <section id="pagination-2" className="pagination-2 section">
          <div className="container">
            <nav className="d-flex justify-content-center" aria-label="Page navigation">
              <ul>
                <li>
                  <a href="#" aria-label="Previous page">
                    <i className="bi bi-arrow-left"></i>
                    <span className="d-none d-sm-inline">Previous</span>
                  </a>
                </li>
                <li><a href="#" className="active">1</a></li>
                <li><a href="#">2</a></li>
                <li><a href="#">3</a></li>
                <li className="ellipsis">...</li>
                <li><a href="#">8</a></li>
                <li><a href="#">9</a></li>
                <li><a href="#">10</a></li>
                <li>
                  <a href="#" aria-label="Next page">
                    <span className="d-none d-sm-inline">Next</span>
                    <i className="bi bi-arrow-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </section>

      </main>
    </>
  );
};

export default Blog;
