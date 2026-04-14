import { Link } from "react-router-dom";
import { getImageUrl } from "../api";

const PLAN_LABELS = {
  plus: "Plus",
  business: "Business",
  enterprise: "Enterprise",
};

const formatDuration = (hours) => {
  if (!hours || Number.isNaN(Number(hours))) return null;
  if (hours < 1) {
    return `${Math.round(hours * 60)} phút`;
  }
  if (hours % 1 === 0) return `${hours} giờ`;
  return `${hours.toFixed(1)} giờ`;
};

export default function CourseCard({ course }) {
  const planTags = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
  const durationLabel = formatDuration(course.durationHours);

  return (
    <div className="col-lg-6 col-md-6 mb-4">
      <div className="course-card">
        <div className="course-image">
          <img 
            src={getImageUrl(course.image) || "/assets/img/education/courses-3.webp"} 
            alt={course.title} 
            className="img-fluid"
            onError={(e) => {
              e.target.src = "/assets/img/education/courses-3.webp";
            }}
          />
          {course.featured && <div className="course-badge">Featured</div>}
          <div className="course-price">
            {course.price === 0 ? "Free" : course.price.toLocaleString() + "đ"}
          </div>
        </div>

        <div className="course-content">
          <div className="course-meta">
            <span className="category">
              {course.category === "Communication"
                ? "Tiếng Anh giao tiếp"
                : course.category || "English"}
            </span>
            <span className="level">{course.level}</span>
            {durationLabel && <span className="duration">{durationLabel}</span>}
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
              {!course.allowIndividualPurchase && <span className="plan-tag badge-only">Plan only</span>}
            </div>
          )}

          <Link to={`/courses/${course.slug}`} className="btn-course">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
