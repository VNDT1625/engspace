const Reading = require('../models/Reading');
const ReadingNote = require('../models/ReadingNote');
const https = require('https');

const fetchTranslate = (url) => new Promise((resolve, reject) => {
    const req = https.get(
        url,
        {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json,text/plain,*/*'
            }
        },
        (resp) => {
            let raw = '';
            resp.on('data', (chunk) => {
                raw += chunk;
            });
            resp.on('end', () => {
                if (resp.statusCode < 200 || resp.statusCode >= 300) {
                    return reject(new Error(`Translate HTTP ${resp.statusCode}`));
                }
                try {
                    resolve(JSON.parse(raw));
                } catch {
                    reject(new Error('Invalid translation response'));
                }
            });
        }
    );
    req.on('error', reject);
    req.end();
});

const normalizeText = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const buildReadingScore = (reading, answers = {}) => {
    const safeAnswers = answers && typeof answers === 'object' ? answers : {};
    let totalGradableQuestions = 0;
    let correctAnswers = 0;

    for (const group of reading.questionGroups || []) {
        for (const question of group.questions || []) {
            const expectedCandidates = [];

            if (Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0) {
                expectedCandidates.push(...question.acceptedAnswers);
            }
            if (Array.isArray(question.answer)) {
                expectedCandidates.push(...question.answer);
            } else if (question.answer !== undefined && question.answer !== null && question.answer !== '') {
                expectedCandidates.push(question.answer);
            }

            const uniqueExpected = [...new Set(expectedCandidates.map(normalizeText).filter(Boolean))];
            if (uniqueExpected.length === 0) continue;

            totalGradableQuestions += 1;
            const userRaw = safeAnswers[String(question.qNumber)] ?? safeAnswers[question.qNumber];
            const userNormalized = normalizeText(userRaw);
            if (userNormalized && uniqueExpected.includes(userNormalized)) {
                correctAnswers += 1;
            }
        }
    }

    const score = totalGradableQuestions > 0
        ? Math.round((correctAnswers / totalGradableQuestions) * 100)
        : 0;

    return { score, correctAnswers, totalGradableQuestions };
};

exports.getReadings = async (req, res) => {
    try {
        // Return summary data without heavy content for the list
        const readings = await Reading.find({}, '-content -questionGroups');
        res.json(readings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReadingDetail = async (req, res) => {
    try {
        const reading = await Reading.findOne({ slug: req.params.slug });
        if (!reading) return res.status(404).json({ message: 'Không tìm thấy bài đọc' });
        res.json(reading);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.translateText = async (req, res) => {
    try {
        const text = (req.query.text || '').trim();
        const source = (req.query.source || 'en').trim() || 'en';
        const target = (req.query.target || 'vi').trim() || 'vi';

        if (!text) {
            return res.status(400).json({ message: 'text is required' });
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
        const data = await fetchTranslate(url);
        const translatedText = Array.isArray(data?.[0]) ? data[0].map(item => item?.[0] || '').join('') : '';
        const detectedSource = data?.[2] || source;

        return res.json({ text, translatedText, source: detectedSource, target });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.saveReadingNote = async (req, res) => {
    try {
        const { readingId, mode = 'practice', answers = {}, highlights = [], durationSeconds = 0 } = req.body;
        if (!readingId) {
            return res.status(400).json({ message: 'readingId is required' });
        }

        const reading = await Reading.findById(readingId);
        if (!reading) {
            return res.status(404).json({ message: 'Reading not found' });
        }

        const normalizedHighlights = Array.isArray(highlights)
            ? highlights
                .filter(item => item && item.phrase)
                .map(item => ({
                    phrase: String(item.phrase).trim(),
                    purpose: String(item.purpose || '').trim(),
                    translation: String(item.translation || '').trim(),
                    source: String(item.source || 'selection').trim()
                }))
            : [];

        const note = await ReadingNote.create({
            user: req.user._id,
            reading: reading._id,
            mode,
            answers,
            highlights: normalizedHighlights,
            durationSeconds: Number(durationSeconds) || 0
        });

        const populatedNote = await note.populate('reading', 'title slug');
        return res.status(201).json(populatedNote);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.submitReadingAttempt = async (req, res) => {
    try {
        const { readingId, mode = 'practice', answers = {}, highlights = [], durationSeconds = 0 } = req.body;
        if (!readingId) {
            return res.status(400).json({ message: 'readingId is required' });
        }

        const reading = await Reading.findById(readingId);
        if (!reading) {
            return res.status(404).json({ message: 'Reading not found' });
        }

        const normalizedHighlights = Array.isArray(highlights)
            ? highlights
                .filter(item => item && item.phrase)
                .map(item => ({
                    phrase: String(item.phrase).trim(),
                    purpose: String(item.purpose || '').trim(),
                    translation: String(item.translation || '').trim(),
                    source: String(item.source || 'selection').trim()
                }))
            : [];

        const scoring = buildReadingScore(reading, answers);
        const attempt = await ReadingNote.create({
            user: req.user._id,
            reading: reading._id,
            mode,
            answers,
            highlights: normalizedHighlights,
            durationSeconds: Number(durationSeconds) || 0,
            score: scoring.score,
            correctAnswers: scoring.correctAnswers,
            totalGradableQuestions: scoring.totalGradableQuestions,
            submittedAt: new Date()
        });

        const populated = await attempt.populate('reading', 'title slug totalQuestions');
        return res.status(201).json(populated);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getMyReadingNotes = async (req, res) => {
    try {
        const { readingId, slug } = req.query;
        const filter = { user: req.user._id };

        if (readingId) {
            filter.reading = readingId;
        } else if (slug) {
            const reading = await Reading.findOne({ slug }).select('_id');
            if (!reading) return res.json([]);
            filter.reading = reading._id;
        }

        const notes = await ReadingNote.find(filter)
            .sort({ createdAt: -1 })
            .limit(30)
            .populate('reading', 'title slug');

        return res.json(notes);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getMyReadingResults = async (req, res) => {
    try {
        const results = await ReadingNote.find({ user: req.user._id })
            .sort({ submittedAt: -1, createdAt: -1 })
            .limit(100)
            .populate('reading', 'title slug totalQuestions');
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.getReadingResultDetail = async (req, res) => {
    try {
        const result = await ReadingNote.findOne({ _id: req.params.id, user: req.user._id })
            .populate('reading');
        if (!result) {
            return res.status(404).json({ message: 'Reading result not found' });
        }
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};