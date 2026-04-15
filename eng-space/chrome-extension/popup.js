// EngSpace Chrome Extension Popup
const API_BASE = 'https://engspace-backend.onrender.com/api';
let selectedText = '';
let currentTab = null;

document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
    // Get selected text from storage (set by content script)
    chrome.storage.local.get(['selectedText', 'activeTab'], (result) => {
        selectedText = result.selectedText || '';
        currentTab = result.activeTab;

        if (selectedText) {
            showExplainButton();
        } else {
            showInstruction();
        }
    });

    // Manual explain from clipboard
    document.getElementById('manual-explain')?.addEventListener('click', explainClipboard);

    // Login
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);

    // Save
    document.getElementById('save-btn')?.addEventListener('click', saveVocab);
}

function showInstruction() {
    document.getElementById('instruction').textContent = 'Select text trên trang → Right click → "Giải nghĩa với EngSpace"';
}

function showExplainButton() {
    const btn = document.getElementById('manual-explain');
    btn.style.display = 'block';
    btn.textContent = `Giải nghĩa: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`;
}

async function explainText(text) {
    showLoading(true);

    try {
        // First check auth
        const token = await getAuthToken();
        if (!token) {
            showLoginForm();
            return;
        }

        // Call AI explain (will proxy to backend → AI service)
        const response = await fetch(`${API_BASE}/extension/ai-explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                word: text,
                context: `Selected from: ${currentTab?.url || 'unknown'}`
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        displayResult(data);

    } catch (error) {
        showStatus(`Lỗi: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function getAuthToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['authToken'], (result) => {
            resolve(result.authToken || null);
        });
    });
}

function showLoginForm() {
    document.getElementById('main').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return showStatus('Vui lòng nhập email/password', 'error');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.token) {
            chrome.storage.local.set({ authToken: data.token });
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            showStatus('Đăng nhập thành công!', 'success');
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        showStatus(`Login lỗi: ${error.message}`, 'error');
    }
}

async function saveVocab() {
    const token = await getAuthToken();
    if (!token) return showLoginForm();

    showLoading(true, 'Đang lưu...');

    try {
        const response = await fetch(`${API_BASE}/extension/save-vocab`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                word: selectedText,
                meaning: document.getElementById('meaning').textContent,
                examples: document.getElementById('examples').textContent,
                sourceUrl: currentTab?.url
            })
        });

        if (response.ok) {
            showStatus('✅ Đã lưu từ vào EngSpace để ôn tập!', 'success');
            setTimeout(() => window.close(), 1500);
        }
    } catch (error) {
        showStatus('Lưu lỗi: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayResult(data) {
    document.getElementById('meaning').innerHTML = `<strong>Nghĩa:</strong> ${data.meaning}`;
    if (data.synonyms) {
        document.getElementById('synonyms').innerHTML = `<strong>Đồng nghĩa:</strong> ${data.synonyms.join(', ')}`;
    }
    document.getElementById('examples').innerHTML = `<strong>Ví dụ:</strong><br>${data.examples || 'N/A'}`;
    document.getElementById('result').style.display = 'block';
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
}

function showLoading(show, text = 'Đang xử lý...') {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('loading').textContent = text;
    if (!show) document.getElementById('result').style.display = 'none';
}

async function explainClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        selectedText = text.trim();
        explainText(selectedText);
    } catch {
        showStatus('Không đọc được clipboard', 'error');
    }
}

// Listen for message from background/content
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'explain') {
        selectedText = request.text;
        currentTab = request.tab;
        explainText(selectedText);
    }
});

