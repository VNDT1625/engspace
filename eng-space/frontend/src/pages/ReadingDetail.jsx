import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api, { getMyReadingNotes, submitReadingAttempt, translateReadingText } from '../api';
import '../assets/css/reading-app.css';

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getHighlightedHtml = (html, noteList) => {
    if (!html || !noteList.length) return html;

    let tempHtml = html;
    const sortedNotes = [...noteList].sort((a, b) => b.phrase.length - a.phrase.length);

    sortedNotes.forEach(note => {
        if (!note.phrase) return;
        const escaped = escapeRegExp(note.phrase);
        // Bỏ \b ở hai đầu để chấp nhận cả đoạn văn có khoảng trắng và xuống dòng
        const regex = new RegExp(`(${escaped})(?![^<]*?>)`, 'gi');
        const color = note.isNote ? '#ffc107' : '#ffeb3b';
        tempHtml = tempHtml.replace(regex, `<mark style="background-color: ${color}; cursor: pointer; border-radius: 2px;" title="${note.purpose || ''}">$1</mark>`);
    });
    return tempHtml;
};

export default function ReadingDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') || 'practice'; // 'exam' or 'practice'

    const [reading, setReading] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
    const [loading, setLoading] = useState(true);
    const [activeTool, setActiveTool] = useState(null); // 'highlight', 'note', 'translate'
    const [highlights, setHighlights] = useState([]);
    const [showNotePanel, setShowNotePanel] = useState(false);
    const [showDictionaryPanel, setShowDictionaryPanel] = useState(false);
    const [dictionaryQuery, setDictionaryQuery] = useState('');
    const [dictionaryResult, setDictionaryResult] = useState('');
    const [translateError, setTranslateError] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotes, setSavedNotes] = useState([]);
    const lastSelectionRef = useRef({ text: '', at: 0 });
    const [tooltipPos, setTooltipPos] = useState({ visible: false, x: 0, y: 0, text: '' });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'h' || e.key === 'H') setActiveTool(prev => prev === 'highlight' ? null : 'highlight');
            if (e.key === 'n' || e.key === 'N') {
                setActiveTool(prev => prev === 'note' ? null : 'note');
                setShowNotePanel(true);
            }
            if (e.key === 't' || e.key === 'T') {
                setActiveTool(prev => prev === 'translate' ? null : 'translate');
                setShowDictionaryPanel(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const fetchReading = async () => {
            try {
                const res = await api.get(`/readings/${slug}`);
                setReading(res.data);
                if (res.data.timeLimit) {
                    setTimeLeft(res.data.timeLimit * 60);
                }
            } catch (err) {
                console.error("Lỗi fetch bài đọc", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReading();
    }, [slug]);

    useEffect(() => {
        if (mode !== 'practice') return;
        const fetchNotes = async () => {
            try {
                const res = await getMyReadingNotes({ slug });
                setSavedNotes(res.data || []);
            } catch (err) {
                if (err.response?.status !== 401) {
                    console.error('Lỗi tải reading notes', err);
                }
            }
        };
        fetchNotes();
    }, [mode, slug]);

    useEffect(() => {
        if (!reading) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [reading]);

    const handleAnswerChange = (qNum, value) => {
        setAnswers({ ...answers, [qNum]: value });
    };

    const runTranslate = async (text) => {
        if (!text?.trim()) return '';
        setIsTranslating(true);
        setTranslateError('');
        try {
            const res = await translateReadingText(text.trim(), 'en', 'vi');
            return res.data?.translatedText || '';
        } catch (err) {
            console.error('Lỗi tra nghĩa', err);
            setTranslateError(err.response?.data?.message || 'Không thể tra nghĩa lúc này.');
            return '';
        } finally {
            setIsTranslating(false);
        }
    };

    const addSimpleHighlight = (phrase, isNote = false) => {
        if (!phrase) return;
        setHighlights((prev) => {
            const existingIdx = prev.findIndex(h => h.phrase.toLowerCase() === phrase.toLowerCase());
            if (existingIdx !== -1) {
                if (isNote && !prev[existingIdx].isNote) {
                    const next = [...prev];
                    next[existingIdx] = { ...next[existingIdx], isNote: true };
                    return next;
                }
                return prev;
            }
            return [
                {
                    id: crypto.randomUUID(),
                    phrase: phrase.trim(),
                    purpose: '',
                    translation: '',
                    createdAt: new Date().toISOString(),
                    isNote: isNote
                },
                ...prev
            ];
        });
        window.getSelection()?.removeAllRanges();
    };

    const handleTextSelectionMouseUp = () => {
        window.setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                setTooltipPos((prev) => ({ ...prev, visible: false }));
                return;
            }

            const text = selection.toString().trim();
            if (!text) return;

            if (activeTool === 'highlight') {
                addSimpleHighlight(text, false);
                setTooltipPos((prev) => ({ ...prev, visible: false }));
                return;
            } else if (activeTool === 'note') {
                addSimpleHighlight(text, true);
                setShowNotePanel(true);
                setTooltipPos((prev) => ({ ...prev, visible: false }));
                setTimeout(() => {
                    // Try to focus the newest generated textarea
                    const textareas = document.querySelectorAll('.pane-notes .note-item textarea');
                    if (textareas.length > 0) textareas[0].focus();
                }, 100);
                return;
            } else if (activeTool === 'translate') {
                setShowDictionaryPanel(true);
                setDictionaryQuery(text);
                handleDictionaryLookup(text);
                setTooltipPos((prev) => ({ ...prev, visible: false }));
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setTooltipPos({
                visible: true,
                x: rect.left + (rect.width / 2),
                y: rect.top - 45,
                text: text
            });
        }, 0);
    };

    const handleDictionaryLookup = async (queryText) => {
        const text = queryText?.trim();
        if (!text) return;
        const translated = await runTranslate(text);
        setDictionaryResult(translated || 'Chưa tra được nghĩa. Vui lòng thử lại.');
    };

    const handleUpdateNote = (id, newText) => {
        setHighlights(prev => prev.map(h => h.id === id ? { ...h, purpose: newText } : h));
    };

    const handleDeleteNote = (id) => {
        setHighlights(prev => prev.filter(h => h.id !== id));
    };

    const workingSeconds = useMemo(() => {
        if (!reading) return 0;
        const total = (reading.timeLimit || 60) * 60;
        return Math.max(0, total - timeLeft);
    }, [reading, timeLeft]);

    const handleFinish = async () => {
        if (!isPractice) {
            alert('Nộp bài thành công!');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                readingId: reading._id,
                mode,
                answers,
                highlights: highlights.map(item => ({
                    phrase: item.phrase,
                    purpose: item.purpose,
                    translation: item.translation,
                    source: 'selection'
                })),
                durationSeconds: workingSeconds
            };
            const res = await submitReadingAttempt(payload);
            const result = res.data;
            setSavedNotes((prev) => [result, ...prev]);
            alert(`Nộp bài thành công! Điểm: ${result.score ?? 0} (${result.correctAnswers ?? 0}/${result.totalGradableQuestions ?? 0})`);
            navigate(`/account?tab=readings&resultId=${result._id}`);
        } catch (err) {
            const message = err.response?.data?.message;
            if (err.response?.status === 401) {
                alert('Bạn cần đăng nhập để nộp bài và lưu note.');
            } else {
                alert(`Nộp bài thất bại: ${message || 'Vui lòng thử lại.'}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const memoizedPassageContent = useMemo(() => {
        if (!reading) return null;
        return (
            <div
                className="passage-content selectable-reading-text"
                onMouseUp={handleTextSelectionMouseUp}
                onClick={(e) => {
                    if (e.target.tagName === 'MARK') {
                        setShowNotePanel(true);
                    }
                }}
                dangerouslySetInnerHTML={{
                    __html: getHighlightedHtml(reading.content, highlights)
                }}
            />
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reading?.content, highlights, activeTool]);

    if (loading) return <div className="p-5 text-center">Đang tải bài đọc...</div>;
    if (!reading) return <div className="p-5 text-center">Không tìm thấy dữ liệu.</div>;

    const isPractice = mode === 'practice';
    const numQuestions = reading.totalQuestions || 13; // default 13 if missing

    return (
        <div className={`reading-app theme-${mode}`}>

            {/* 1. TOP HEADER */}
            <header className="reading-header">
                <div className="test-info">
                    {/* Fake brand or logo could go here */}
                    <h1>{isPractice ? '' : '[YouPass Collect] - '}{reading.title}</h1>
                    {!isPractice && <span>{Math.ceil(timeLeft / 60)} minutes remaining</span>}
                </div>

                <div className="header-tools">
                    <i className="bi bi-wifi"></i>
                    <i className="bi bi-bell"></i>
                    <i className="bi bi-list"></i>
                    <button className="btn btn-sm btn-outline-secondary ms-3" onClick={() => navigate('/readinglist')} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', color: 'inherit' }}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
            </header>

            {/* 2. PRACTICE SPECIFIC TOOLBAR */}
            {isPractice && (
                <div className="practice-toolbar">
                    <div style={{ flex: 1 }}></div>
                    <div className="timer-pill">
                        <i className="bi bi-clock-history"></i> {formatTime(timeLeft)}
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn-tool" onClick={() => setShowNotePanel((prev) => !prev)}>
                            <i className="bi bi-pencil-square"></i> Xem note
                        </button>
                        <button className="btn-tool"><i className="bi bi-gear"></i> Cài đặt</button>
                    </div>
                </div>
            )}

            {/* 3. MULTI PANE WORKSPACE */}
            <div className="reading-workspace-v2">

                {/* Optional Toolbar (Practice left side) */}
                {isPractice && (
                    <div className="tool-sidebar">
                        <button
                            type="button"
                            className={`tool-icon ${activeTool === 'highlight' ? 'active' : ''}`}
                            title="Highlight Phím (H)"
                            onClick={() => setActiveTool(prev => prev === 'highlight' ? null : 'highlight')}
                        >
                            <i className="bi bi-highlighter"></i>
                            Highlight Phím (H)
                        </button>
                        <button
                            type="button"
                            className={`tool-icon ${activeTool === 'note' ? 'active' : ''}`}
                            title="Notes Phím (N)"
                            onClick={() => {
                                setActiveTool(prev => prev === 'note' ? null : 'note');
                                setShowNotePanel(true);
                            }}
                        >
                            <i className="bi bi-journal-text"></i>
                            Notes Phím (N)
                        </button>
                        <button
                            type="button"
                            className={`tool-icon ${activeTool === 'translate' ? 'active' : ''}`}
                            title="Tra từ vựng Phím (T)"
                            onClick={() => {
                                setActiveTool(prev => prev === 'translate' ? null : 'translate');
                                setShowDictionaryPanel(true);
                            }}
                        >
                            <i className="bi bi-translate"></i>
                            Tra từ vựng Phím (T)
                        </button>
                    </div>
                )}

                {/* LEFT PANE: PASSAGE */}
                <div className="pane-left">
                    {isPractice && <h3 className="mb-4 text-center fw-bold text-dark">{reading.title}</h3>}
                    {memoizedPassageContent}
                </div>

                {/* RIGHT PANE: QUESTIONS */}
                <div className="pane-right selectable-reading-text" onMouseUp={handleTextSelectionMouseUp}>

                    <div className="question-group-header">
                        Part 1 <br /> Read the text and answer questions 1-{numQuestions}
                    </div>

                    {reading.questionGroups?.map((group, gIdx) => (
                        <div key={gIdx} className="question-group">
                            <h5 className="mb-2 fw-bold">{group.title}</h5>
                            <p className="q-instruction">{group.instruction}</p>

                            {group.type === "MATCHING" && (
                                <div className="mb-4 p-3 bg-light border">
                                    {group.headingOptions?.map(opt => (
                                        <div key={opt.val} className="mb-1"><strong>{opt.val}</strong>  {opt.text}</div>
                                    ))}
                                </div>
                            )}

                            {group.questions?.map(q => (
                                <div key={q.qNumber} className="q-item">
                                    <div className="q-number">{q.qNumber}</div>
                                    <div className="q-content">
                                        <div className="q-text">{q.qText}</div>

                                        {group.type === "TFNG" && (
                                            <div className="tfng-options">
                                                {['TRUE', 'FALSE', 'NOT GIVEN'].map(val => (
                                                    <label key={val} className="tfng-label">
                                                        <input
                                                            type="radio"
                                                            name={`q-${q.qNumber}`}
                                                            value={val}
                                                            checked={answers[q.qNumber] === val}
                                                            onChange={(e) => handleAnswerChange(q.qNumber, e.target.value)}
                                                        />
                                                        {val}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {group.type === "MATCHING" && (
                                            <select
                                                className="heading-select mt-2"
                                                value={answers[q.qNumber] || ""}
                                                onChange={(e) => handleAnswerChange(q.qNumber, e.target.value)}
                                            >
                                                <option value="">-- Choose --</option>
                                                {group.headingOptions?.map(opt => (
                                                    <option key={opt.val} value={opt.val}>{opt.val}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Padding so scrolling is easier at the bottom */}
                    <div style={{ height: '60px' }}></div>
                </div>
                {showNotePanel && isPractice && (
                    <div className="pane-notes">
                        <div className="pane-notes-header">
                            <button type="button" onClick={() => setShowNotePanel(false)}>
                                Ẩn note
                            </button>
                            <button type="button" onClick={() => setHighlights([])}>
                                Xóa tất cả note
                            </button>
                        </div>

                        <div className="note-list-scroll">
                            {highlights.filter(h => h.isNote).length === 0 && (
                                <div className="empty-note text-muted text-center pt-4">Bôi đen cụm từ để tạo note nhé.</div>
                            )}
                            {highlights.filter(h => h.isNote).map((item) => (
                                <div key={item.id} className="note-item">
                                    <div className="note-item-header">
                                        <div className="phrase">{item.phrase}</div>
                                        <button className="btn-delete-note" onClick={() => handleDeleteNote(item.id)}>
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                    <textarea
                                        rows="2"
                                        placeholder="Nhập nội dung cho note này..."
                                        value={item.purpose || ''}
                                        onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. FOOTER VISUALS */}
            <footer className="reading-footer">
                <div className="footer-section">
                    <span className="part-label">Part 1</span>
                    <div className="pagination-squares">
                        {Array.from({ length: numQuestions }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                className={`q-square ${answers[num] ? 'answered' : ''}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="footer-section">
                    {!isPractice && (
                        <>
                            <button className="btn-icon"><i className="bi bi-arrow-left"></i></button>
                            <button className="btn-icon"><i className="bi bi-arrow-right"></i></button>
                        </>
                    )}

                    <div className="btn-check-submit">
                        {isPractice ? (
                            <button className="btn-practice-submit" onClick={handleFinish} disabled={isSaving}>
                                {isSaving ? 'Đang lưu...' : 'Hoàn thành'}
                            </button>
                        ) : (
                            <i className="bi bi-check-lg" onClick={() => alert('Nộp bài thành công!')}></i>
                        )}
                    </div>
                </div>
            </footer>

            {tooltipPos.visible && !activeTool && (
                <div
                    className="selection-tooltip"
                    style={{
                        position: 'fixed',
                        top: tooltipPos.y,
                        left: tooltipPos.x,
                        zIndex: 1000,
                        background: '#333',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        display: 'flex',
                        gap: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateX(-50%)',
                        fontSize: '0.9rem'
                    }}
                >
                    <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setTooltipPos((prev) => ({ ...prev, visible: false }));
                            addSimpleHighlight(tooltipPos.text, false);
                        }}
                    >
                        <i className="bi bi-highlighter"></i> Highlight
                    </button>
                    <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setTooltipPos((prev) => ({ ...prev, visible: false }));
                            addSimpleHighlight(tooltipPos.text, true);
                            setShowNotePanel(true);
                            setTimeout(() => {
                                const textareas = document.querySelectorAll('.pane-notes .note-item textarea');
                                if (textareas.length > 0) textareas[0].focus();
                            }, 100);
                        }}
                    >
                        <i className="bi bi-journal-text"></i> Ghi chú
                    </button>
                    <button
                        type="button"
                        style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setTooltipPos((prev) => ({ ...prev, visible: false }));
                            setShowDictionaryPanel(true);
                            setDictionaryQuery(tooltipPos.text);
                            handleDictionaryLookup(tooltipPos.text);
                        }}
                    >
                        <i className="bi bi-translate"></i> Tra từ
                    </button>
                </div>
            )}



            {showDictionaryPanel && isPractice && (
                <aside className="floating-panel dictionary-panel">
                    <div className="panel-head">
                        <h4>Tra từ / cụm từ</h4>
                        <button type="button" className="panel-close" onClick={() => setShowDictionaryPanel(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="dictionary-form">
                        <input
                            type="text"
                            value={dictionaryQuery}
                            onChange={(e) => setDictionaryQuery(e.target.value)}
                            placeholder="Nhập từ hoặc cụm từ tiếng Anh"
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleDictionaryLookup(dictionaryQuery)}
                            disabled={isTranslating}
                        >
                            {isTranslating ? 'Đang tra...' : 'Tra cứu'}
                        </button>
                    </div>
                    <div className="dictionary-result">
                        {dictionaryResult || 'Kết quả dịch sẽ hiển thị tại đây.'}
                    </div>
                    {translateError && <p className="text-danger mt-2 mb-0">{translateError}</p>}
                </aside>
            )}
        </div>
    );
}