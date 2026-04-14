// Background Service Worker - Context Menu Handler
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu
    chrome.contextMenus.create({
        id: "explain-selection",
        title: "🎯 Giải nghĩa với EngSpace",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "explain-selection" && info.selectionText) {
        // Store selection for popup
        chrome.storage.local.set({
            selectedText: info.selectionText,
            activeTab: tab
        });

        // Open popup
        chrome.action.openPopup();

        // Send to content script if needed
        chrome.tabs.sendMessage(tab.id, {
            action: "explain",
            text: info.selectionText,
            tab: tab
        });
    }
});

// Listen for content script selection
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelection") {
        chrome.storage.local.set({
            selectedText: request.text,
            activeTab: sender.tab
        });
    }
});

