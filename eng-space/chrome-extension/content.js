// Content Script - Inject to all pages
// Optional: Listen for double-click or selection change
document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 1 && selection.length < 100) {
        // Send to background
        chrome.runtime.sendMessage({
            action: "getSelection",
            text: selection
        });
    }
});

// Context menu already handled by background

