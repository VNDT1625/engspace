const VocabWord = require('../models/VocabWord');
// Import removed as it's not used
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    AI giải nghĩa từ vựng cho extension
// @route   POST /api/extension/ai-explain
// @access  Private
exports.explainVocab = async (req, res) => {
    try {
        const { word, context } = req.body;

        if (!word || word.length < 1) {
            return res.status(400).json({ error: 'Từ cần giải nghĩa là bắt buộc' });
        }

        const prompt = `Bạn là trợ giảng tiếng Anh thông minh của EngSpace. Giải nghĩa từ "${word}" trong ngữ cảnh: "${context || 'general'}".
    
Trả lời JSON format:
{
  "meaning": "nghĩa chính (tiếng Việt)",
  "synonyms": ["từ đồng nghĩa 1", "từ 2"],
  "examples": ["Câu ví dụ 1.", "Câu ví dụ 2."],
  "grammar": "Loại từ (danh từ/động từ...) + công thức nếu có"
}
    
Giữ ngắn gọn, chính xác, phù hợp học sinh.`;

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
            messages: [
                { role: "system", content: "Trợ giảng Anh-Việt chuyên nghiệp" },
                { role: "user", content: prompt }
            ]
        });

        let explanation = aiResponse.data.reply;

        // Parse JSON nếu AI trả JSON
        try {
            explanation = JSON.parse(explanation);
        } catch {
            // Fallback: extract manually
            explanation = {
                meaning: explanation,
                synonyms: [],
                examples: [],
                grammar: ''
            };
        }

        res.json({
            meaning: explanation.meaning || explanation,
            synonyms: explanation.synonyms || [],
            examples: explanation.examples || [],
            grammar: explanation.grammar || ''
        });

    } catch (error) {
        console.error('AI Explain error:', error.message);
        res.status(500).json({
            error: 'Không thể giải nghĩa lúc này. Thử lại sau.',
            fallback: {
                meaning: `Từ "${req.body.word}" - tra Google Translate để tạm thời.`,
                synonyms: []
            }
        });
    }
};

// @desc    Lưu từ vựng từ extension
// @route   POST /api/extension/save-vocab  
// @access  Private
exports.saveVocab = async (req, res) => {
    try {
        const { word, meaning, synonyms, examples, sourceUrl } = req.body;

        const existing = await VocabWord.findOne({
            userId: req.user.id,
            word: word.toLowerCase().trim()
        });

        if (existing) {
            // Update nếu đã có
            existing.meaning = meaning;
            existing.synonyms = synonyms;
            existing.examples = examples;
            existing.sourceUrl = sourceUrl;
            existing.lastReviewed = new Date();
            existing.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000); // review sau 1 ngày
            await existing.save();

            return res.json({
                message: '✅ Từ đã được cập nhật!',
                vocab: existing
            });
        }

        // Tạo mới
        const vocab = new VocabWord({
            userId: req.user.id,
            word: word.toLowerCase().trim(),
            meaning,
            synonyms,
            examples,
            sourceUrl,
            context: req.body.context || ''
        });

        await vocab.save();

        res.status(201).json({
            message: '✅ Đã lưu từ vựng để ôn tập!',
            vocab
        });

    } catch (error) {
        console.error('Save vocab error:', error);
        res.status(500).json({ error: 'Lưu từ vựng thất bại' });
    }
};

// @desc    Lấy danh sách từ vựng của user
// @route   GET /api/extension/my-vocab
// @access  Private
exports.getMyVocab = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const query = {
            userId: req.user.id
        };

        if (search) {
            query.word = { $regex: search, $options: 'i' };
        }

        const vocab = await VocabWord
            .find(query)
            .sort({ lastReviewed: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        const total = await VocabWord.countDocuments(query);

        res.json({
            vocab,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get vocab error:', error);
        res.status(500).json({ error: 'Lấy từ vựng thất bại' });
    }
};

