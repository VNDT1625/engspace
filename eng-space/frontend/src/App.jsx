import HomePage from "./pages/HomePage";
import About from "./pages/About";
import { Routes, Route } from "react-router-dom";
import Courses from "./pages/Courses";
import Pricing from "./pages/Pricing";
import CourseDetails from "./pages/CourseDetails";
import CourseLearn from "./pages/CourseLearn";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Blog from "./pages/Blog";
import Enroll from "./pages/Enroll";
import Quiz from "./pages/Quiz";
import QuizDetail from "./pages/QuizDetail";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";
import PlanCheckout from "./pages/PlanCheckout";
import MainLayout from "./layouts/MainLayout";
import ReadingList from './pages/ReadingList';
import ReadingDetail from './pages/ReadingDetail';
import ReadingResultDetail from "./pages/ReadingResultDetail";
import AITutorPage from "./pages/AITutorPage";
import MyVocab from "./pages/MyVocab";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/courses/:slug/learn" element={<CourseLearn />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/checkout/:slug" element={<Checkout />} />
        <Route path="/pricing/checkout/:plan" element={<PlanCheckout />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:slug" element={<QuizDetail />} />
        <Route path="/readinglist" element={<ReadingList />} />
        <Route path="/reading-results/:id" element={<ReadingResultDetail />} />
        <Route path="/ai-tutor" element={<AITutorPage />} />
        <Route path="/my-vocab" element={<MyVocab />} />
      </Route>
      <Route path="/readinglist/:slug" element={<ReadingDetail />} />
    </Routes>

  );
}
