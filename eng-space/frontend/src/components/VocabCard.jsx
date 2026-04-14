const VocabCard = ({ vocab, onReview }) => {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('vi-VN');
  
  const handleReview = () => {
    if (onReview) onReview();
  };

  return (
    <div className="card h-100 shadow-sm hover-shadow">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">{vocab.word}</h6>
        <span className="badge bg-success fs-2">{formatDate(vocab.createdAt)}</span>
      </div>
      <div className="card-body">
        <h6 className="card-title text-primary mb-3">{vocab.meaning}</h6>
        
        {vocab.synonyms && vocab.synonyms.length > 0 && (
          <div className="mb-3">
            <small className="text-muted">Đồng nghĩa:</small>
            <div className="mt-1">
              {vocab.synonyms.slice(0, 3).map((syn, i) => (
                <span key={i} className="badge bg-light text-dark me-1 mb-1">{syn}</span>
              ))}
            </div>
          </div>
        )}
        
        {vocab.examples && (
          <div className="mb-3">
            <small className="text-muted">Ví dụ:</small>
            <p className="mt-1 small fst-italic">{vocab.examples.split('\\n')[0] || vocab.examples}</p>
          </div>
        )}
        
        {vocab.grammar && (
          <div className="mb-3">
            <small className="text-warning">{vocab.grammar}</small>
          </div>
        )}
        
        {vocab.sourceUrl && (
          <small className="text-muted d-block mb-2">
            📖 {vocab.sourceUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
          </small>
        )}
      </div>
      <div className="card-footer bg-light border-0">
        <button 
          className="btn btn-outline-primary btn-sm w-100" 
          onClick={handleReview}
        >
          🎯 Ôn lại
        </button>
      </div>
    </div>
  );
};

export default VocabCard;

