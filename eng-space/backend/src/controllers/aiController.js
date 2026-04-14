const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 30000);

const getErrorMessage = (err) =>
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    'Unknown AI service error';

const buildChatFallbackReply = (messages = []) => {
    const lastUserMessage = [...messages].reverse().find((m) => m?.role === 'user')?.content?.trim();

    if (lastUserMessage) {
        return `AI Tutor is temporarily unavailable. I received your message: "${lastUserMessage}". Please try again in a moment.`;
    }

    return 'AI Tutor is temporarily unavailable. Please try again in a moment.';
};

exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages array." });
        }
        
        const response = await axios.post(
            `${AI_SERVICE_URL}/chat`,
            { messages },
            { timeout: AI_TIMEOUT_MS }
        );
        res.json({ reply: response.data.reply });
        
    } catch (err) {
        const detail = getErrorMessage(err);
        console.error("Error communicating with AI service:", detail);

        res.status(200).json({
            reply: buildChatFallbackReply(req.body?.messages),
            degraded: true,
            error: detail
        });
    }
};

exports.videoChat = async (req, res) => {
    try {
        const { youtube_url, question } = req.body;
        
        if (!youtube_url || !question) {
            return res.status(400).json({ error: "youtube_url và question là bắt buộc." });
        }
        
        const response = await axios.post(
            `${AI_SERVICE_URL}/video-chat`,
            { youtube_url, question },
            { timeout: AI_TIMEOUT_MS }
        );
        res.json({ reply: response.data.reply });
        
    } catch (err) {
        const detail = getErrorMessage(err);
        console.error("Error communicating with AI video service:", detail);
        
        const msg = detail || "Mô hình không nhận được phụ đề hoặc gặp lỗi. Vui lòng thử link khác.";
        res.status(502).json({ error: msg });
    }
};
