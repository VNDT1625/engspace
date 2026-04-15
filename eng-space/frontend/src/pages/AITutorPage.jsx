import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Use AI_URL from environment variable (AI Service), with fallback to localhost for development
const AI_SERVICE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
const API_URL = `${AI_SERVICE_URL}`;

export default function AITutorPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('text'); // text, voice, video

    // TEXT CHAT STATE
    const [textMessages, setTextMessages] = useState([{ role: "system", content: "Hello! I am your EngSpace AI Tutor. How can I help you today?" }]);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);

    // VOICE CHAT STATE
    const [voiceMessages, setVoiceMessages] = useState([{ role: "system", content: "This is Voice Chat Mode. Press the microphone to speak." }]);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceLoading, setIsVoiceLoading] = useState(false);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // VIDEO CHAT STATE
    const [videoUrl, setVideoUrl] = useState('');
    const [activeVideoUrl, setActiveVideoUrl] = useState('');
    const [videoQuestion, setVideoQuestion] = useState('');
    const [videoMsg, setVideoMsg] = useState('');
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    useEffect(() => {
        // Setup Web Speech API cho chức năng Voice Chat
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US'; // Hoặc vi-VN theo nhu cầu

            recognitionRef.current.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                handleVoiceSubmit(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        } else {
            console.warn("Trình duyệt không hỗ trợ Web Speech API.");
        }

        return () => {
            if (synthRef.current) synthRef.current.cancel();
        };
    }, [voiceMessages]);

    const speakText = (text) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        synthRef.current.speak(utterance);
    };

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!textInput.trim() || isTextLoading) return;

        const newMsgs = [...textMessages, { role: "user", content: textInput }];
        setTextMessages(newMsgs);
        setTextInput('');
        setIsTextLoading(true);

        try {
            const res = await axios.post(`${API_URL}/chat`, { messages: newMsgs });
            const aiReply = res.data?.reply || "AI Tutor did not return a response.";
            setTextMessages([...newMsgs, { role: "assistant", content: aiReply }]);
        } catch (err) {
            console.error(err);
            const errMsg =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                err.message ||
                "Sorry, I am facing a technical issue. Please try again.";
            setTextMessages([...newMsgs, { role: "assistant", content: errMsg }]);
        } finally {
            setIsTextLoading(false);
        }
    };

    const handleVoiceSubmit = async (transcript) => {
        const newMsgs = [...voiceMessages, { role: "user", content: transcript }];
        setVoiceMessages(newMsgs);
        setIsVoiceLoading(true);

        try {
            const res = await axios.post(`${API_URL}/chat`, { messages: newMsgs });
            const aiReply = res.data?.reply || "AI Tutor did not return a response.";
            setVoiceMessages([...newMsgs, { role: "assistant", content: aiReply }]);
            speakText(aiReply);
        } catch (err) {
            console.error(err);
            const errMsg =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                err.message ||
                "Error connecting to AI.";
            setVoiceMessages([...newMsgs, { role: "assistant", content: errMsg }]);
        } finally {
            setIsVoiceLoading(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            synthRef.current?.cancel(); // Dừng nếu AI đang nói
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (!activeVideoUrl || !videoQuestion || isVideoLoading) return;

        setIsVideoLoading(true);
        setVideoMsg("AI đang đọc transcript từ video Youtube, xin chờ...");
        try {
            const res = await axios.post(`${API_URL}/video-chat`, {
                youtube_url: activeVideoUrl,
                question: videoQuestion
            });
            setVideoMsg(res.data.reply);
        } catch (err) {
            setVideoMsg(err.response?.data?.error || "Error analyzing video.");
        } finally {
            setIsVideoLoading(false);
        }
    };

    const loadVideo = () => {
        if (!videoUrl) return;
        setActiveVideoUrl(videoUrl);
        setVideoMsg('');
        setVideoQuestion('');
    };

    const extractYoutubeId = (url) => {
        if (!url) return '';
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
        const match = regex.exec(url);
        return match ? match[1] : '';
    };

    return (
        <main className="main" style={{ minHeight: '80vh', backgroundColor: '#f8f9fa' }}>
            <div className="container py-5 mt-4">
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-8 text-center" data-aos="fade-up">
                        <h2 className="fw-bold" style={{ color: '#0d6efd' }}>Qwen AI English Tutor</h2>
                        <p className="text-muted">Your dedicated AI assistant - Fine-tuned for EngSpace learners.</p>
                    </div>
                </div>

                <div className="row" data-aos="fade-up">
                    <div className="col-12 mb-4">
                        <ul className="nav nav-pills justify-content-center bg-white p-2 rounded shadow-sm">
                            <li className="nav-item mx-2">
                                <button className={`nav-link fw-semibold px-4 ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>
                                    <i className="bi bi-chat-text-fill me-2"></i>Q&A Text
                                </button>
                            </li>
                            <li className="nav-item mx-2">
                                <button className={`nav-link fw-semibold px-4 ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>
                                    <i className="bi bi-mic-fill me-2"></i>Voice Chat
                                </button>
                            </li>
                            <li className="nav-item mx-2">
                                <button className={`nav-link fw-semibold px-4 ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
                                    <i className="bi bi-youtube me-2"></i>Video Reading
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* TEXT CHAT TAB */}
                {activeTab === 'text' && (
                    <div className="card shadow border-0 mx-auto" style={{ maxWidth: '850px', height: '600px', borderRadius: '15px' }} data-aos="fade-in">
                        <div className="card-body d-flex flex-column p-0">
                            <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', backgroundColor: '#fdfdfd' }}>
                                {textMessages.map((msg, i) => (
                                    <div key={i} className={`mb-4 d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-3 border ${msg.role === 'user' ? 'bg-primary text-white text-end' : 'bg-white text-dark'}`}
                                            style={{ maxWidth: '80%', borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</div>
                                        </div>
                                    </div>
                                ))}
                                {isTextLoading && (
                                    <div className="text-start mb-3">
                                        <div className="px-3 py-2 bg-light border text-muted d-inline-block rounded-pill">
                                            <i className="bi bi-three-dots"></i> Typing...
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-white border-top">
                                <form onSubmit={handleTextSubmit} className="d-flex gap-2">
                                    <input type="text" className="form-control form-control-lg rounded-pill px-4"
                                        value={textInput} onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Type your question in English or Vietnamese..." disabled={isTextLoading} />
                                    <button type="submit" className="btn btn-primary rounded-circle shadow-sm" style={{ width: '50px', height: '50px' }} disabled={isTextLoading || !textInput.trim()}>
                                        <i className="bi bi-send-fill"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* VOICE CHAT TAB */}
                {activeTab === 'voice' && (
                    <div className="card shadow border-0 mx-auto" style={{ maxWidth: '850px', height: '600px', borderRadius: '15px' }} data-aos="fade-in">
                        <div className="card-body d-flex flex-column align-items-center justify-content-center p-4 position-relative">

                            <div className="flex-grow-1 w-100 mb-4" style={{ overflowY: 'auto' }}>
                                {voiceMessages.slice(-2).map((msg, i) => (
                                    <div key={i} className={`mb-4 text-center p-4 rounded-4 ${msg.role === 'user' ? 'bg-light' : 'bg-primary bg-opacity-10'}`}>
                                        <h5 className={msg.role === 'user' ? 'text-secondary fw-bold' : 'text-primary fw-bold'}>
                                            {msg.role === 'user' ? 'You said:' : 'AI Tutor replied:'}
                                        </h5>
                                        <p className="fs-5 mb-0" style={{ lineHeight: 1.8 }}>{msg.content}</p>
                                    </div>
                                ))}
                                {isVoiceLoading && (
                                    <div className="text-center w-100 text-muted mt-3">
                                        <div className="spinner-grow spinner-grow-sm text-primary me-2" role="status"></div>
                                        <span>AI is processing your speech...</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto text-center pb-3">
                                <button
                                    onClick={toggleListening}
                                    className={`btn rounded-circle d-flex align-items-center justify-content-center shadow-lg ${isListening ? 'btn-danger pulse-animation' : 'btn-success'}`}
                                    style={{ width: '90px', height: '90px', fontSize: '2.5rem', margin: '0 auto', transition: 'all 0.3s' }}
                                    disabled={isVoiceLoading || !recognitionRef.current}
                                >
                                    <i className={`bi ${isListening ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                                </button>
                                <p className="mt-3 text-muted fw-semibold">
                                    {!recognitionRef.current ? "Trình duyệt của bạn không hỗ trợ Voice. Vui lòng dùng Chrome/Edge." :
                                        isListening ? "Listening... (Nhấn để ngừng)" : "Nhấn Mic và bắt đầu nói chuyện"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIDEO READING TAB */}
                {activeTab === 'video' && (
                    <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }} data-aos="fade-in">
                        <div className="card-body p-4">
                            <div className="input-group mb-4 shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                                <span className="input-group-text bg-white text-danger border-end-0">
                                    <i className="bi bi-youtube fs-5"></i>
                                </span>
                                <input type="text" className="form-control form-control-lg border-start-0 ps-0" placeholder="Paste YouTube link here..."
                                    value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                                <button className="btn btn-dark px-4 fw-bold" onClick={loadVideo}>Load Video</button>
                            </div>

                            {!activeVideoUrl && (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-collection-play" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
                                    <h4 className="mt-3 fw-light">Nhập đường dẫn Youtube để phân tích bài nghe</h4>
                                </div>
                            )}

                            {activeVideoUrl && (
                                <div className="row g-4 mt-2">
                                    <div className="col-lg-7">
                                        <div className="ratio ratio-16x9 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                            {extractYoutubeId(activeVideoUrl) ? (
                                                <iframe src={`https://www.youtube.com/embed/${extractYoutubeId(activeVideoUrl)}`} allowFullScreen border="0"></iframe>
                                            ) : (
                                                <div className="bg-light d-flex align-items-center justify-content-center">Invalid Video URL</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-lg-5">
                                        <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#f6f9fc' }}>
                                            <div className="card-header bg-transparent border-bottom-0 pt-4 pb-0">
                                                <h5 className="fw-bold text-primary"><i className="bi bi-robot me-2"></i>Ask about this video</h5>
                                            </div>
                                            <div className="card-body d-flex flex-column pt-3">
                                                <div className="flex-grow-1 bg-white p-3 rounded shadow-sm mb-4 border" style={{ overflowY: 'auto', minHeight: '300px', maxHeight: '400px' }}>
                                                    {videoMsg ? (
                                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: videoMsg }}></div>
                                                    ) : (
                                                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted text-center px-4">
                                                            <i className="bi bi-info-circle-fill fs-1 text-primary mb-2 opacity-50"></i>
                                                            <p>Mô hình Qwen sẽ tự động lấy Subtitles từ Video này.<br />Bạn có thể yêu cầu AI tóm tắt, tìm ý chính hay giải thích các từ vựng xuất hiện trong video.</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <form onSubmit={handleVideoSubmit}>
                                                    <div className="position-relative">
                                                        <textarea
                                                            className="form-control bg-white shadow-sm pe-5 border-0"
                                                            style={{ resize: 'none', borderRadius: '15px' }}
                                                            rows="3"
                                                            placeholder="Ví dụ: Tóm tắt 3 ý chính của video này..."
                                                            value={videoQuestion}
                                                            onChange={(e) => setVideoQuestion(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleVideoSubmit(e); } }}
                                                            disabled={isVideoLoading}
                                                        ></textarea>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary position-absolute bottom-0 end-0 m-2 rounded-circle shadow"
                                                            style={{ width: '45px', height: '45px' }}
                                                            disabled={isVideoLoading || !videoQuestion.trim()}
                                                        >
                                                            {isVideoLoading ? <div className="spinner-border spinner-border-sm"></div> : <i className="bi bi-send-fill"></i>}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Custom animation cho Voice Mic */}
            <style jsx="true">{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(220, 53, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }
                .pulse-animation {
                    animation: pulse 1.5s infinite;
                }
            `}</style>
        </main>
    );
}
