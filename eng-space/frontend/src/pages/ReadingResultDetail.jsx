import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getReadingResultDetail } from "../api";
import { useAuth } from "../context/AuthContext";

const ReadingResultDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await getReadingResultDetail(id);
        setResult(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchResult();
  }, [id, user]);

  const questionRows = useMemo(() => {
    if (!result?.reading?.questionGroups) return [];
    return result.reading.questionGroups.flatMap((group) =>
      (group.questions || []).map((q) => ({
        qNumber: q.qNumber,
        qText: q.qText,
        userAnswer: result.answers?.[q.qNumber] ?? result.answers?.[String(q.qNumber)] ?? "",
      }))
    );
  }, [result]);

  if (!user) return <Navigate to="/enroll" replace />;

  return (
    <main className="main py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Chi tiết bài Reading đã nộp</h1>
          <Link to="/account?tab=readings" className="btn btn-outline-secondary btn-sm">
            Quay lại trang cá nhân
          </Link>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : !result ? (
          <p>Không tìm thấy kết quả bài làm.</p>
        ) : (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h5">{result.reading?.title || "Reading"}</h2>
                <div className="row g-3 mt-1">
                  <div className="col-md-3"><strong>Điểm:</strong> {result.score ?? 0}</div>
                  <div className="col-md-3"><strong>Số câu đúng:</strong> {result.correctAnswers ?? 0}/{result.totalGradableQuestions ?? 0}</div>
                  <div className="col-md-3"><strong>Thời gian làm:</strong> {result.durationSeconds ? `${result.durationSeconds}s` : "-"}</div>
                  <div className="col-md-3"><strong>Nộp lúc:</strong> {new Date(result.submittedAt || result.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h3 className="h5 mb-3">Bài làm của bạn</h3>
                {questionRows.length === 0 ? (
                  <p className="mb-0">Không có dữ liệu câu hỏi để hiển thị.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Câu</th>
                          <th>Nội dung</th>
                          <th>Đáp án của bạn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionRows.map((row) => (
                          <tr key={`${row.qNumber}-${row.qText}`}>
                            <td>{row.qNumber}</td>
                            <td>{row.qText}</td>
                            <td>{row.userAnswer || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h3 className="h5 mb-3">Highlights / Notes</h3>
                {result.highlights?.length ? (
                  <div className="row g-3">
                    {result.highlights.map((item, index) => (
                      <div className="col-md-6" key={`${item.phrase}-${index}`}>
                        <div className="border rounded p-3 h-100">
                          <div><strong>{item.phrase}</strong></div>
                          {item.translation ? <p className="mb-1 text-muted">Nghĩa: {item.translation}</p> : null}
                          {item.purpose ? <p className="mb-0">Mục đích: {item.purpose}</p> : <p className="mb-0 text-muted">Không có ghi chú mục đích.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-0">Bài làm này không có highlight/note.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ReadingResultDetail;
