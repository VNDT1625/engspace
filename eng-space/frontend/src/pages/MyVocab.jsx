import React, { useState, useEffect } from 'react';
import VocabCard from '../components/VocabCard';
import { getMyVocab } from '../api'; 
import ScrollToTop from '../components/ScrollToTop';

const MyVocab = () => {
  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const loadVocab = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const data = await getMyVocab({ page: pageNum, search: searchTerm });
      setVocab(data.vocab);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Load vocab error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocab(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading) return <div className="container py-5"><div className="text-center">Đang tải từ vựng...</div></div>;

  return (
    <div className="my-vocab-page py-5 bg-light min-vh-100">
      <ScrollToTop />
      <div className="container">
        <div className="row mb-4">
          <div className="col">
            <h1 className="display-5 fw-bold mb-3">📚 Từ vựng của tôi</h1>
            <p className="lead text-muted">Ôn tập từ lưu từ Chrome Extension</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">🔍</span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tìm từ..."
                value={search} 
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="col-md-6 text-end">
            <div className="text-muted small">
              {pagination.total || 0} từ • Trang {page} / {pagination.pages || 1}
            </div>
          </div>
        </div>

        {vocab.length === 0 ? (
          <div className="text-center py-5">
            <svg className="mb-3" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M5.255 5.99a.5.5 0 0 1 .411.574.712.712 0 0 0 1.043 0 .5.5 0 0 1 .976 0 .712.712 0 0 0 1.051 0 .5.5 0 0 1 .82-.574A7 7 0 1 1 4 8.5c0 1.13.256 2.226.745 3.23a.5.5 0 0 1-.896.318A6.999 6.999 0 0 0 5.255 5.99zM10 12.5a.5.5 0 0 1-.736-.184l-1.579-3.158a.5.5 0 0 1 .948-.684l1.579 3.158A.5.5 0 0 1 10 12.5z"/>
            </svg>
            <h3>Chưa có từ nào</h3>
            <p className="text-muted">Sử dụng Chrome Extension để lưu từ đầu tiên!</p>
            <a href="/courses" className="btn btn-primary">Bắt đầu học</a>
          </div>
        ) : (
          <div className="row g-4">
            {vocab.map((item) => (
              <div key={item._id} className="col-lg-6 col-xl-4">
                <VocabCard vocab={item} onReview={() => loadVocab(page, search)} />
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="row mt-5">
            <div className="col text-center">
              <nav>
                <ul className="pagination justify-content-center">
                  <li className="page-item disabled={page === 1}">
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
                  </li>
                  {Array.from({length: pagination.pages}, (_, i) => i+1).map(p => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                    </li>
                  ))}
                  <li className="page-item" disabled={page === pagination.pages}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === pagination.pages}>Sau</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVocab;

