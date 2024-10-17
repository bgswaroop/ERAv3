chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveSnippet") {
        chrome.storage.sync.get("snippets", (data) => {
            const snippets = data.snippets || [];
            snippets.push(request.snippet);
            chrome.storage.sync.set({ snippets }, () => {
                sendResponse({ success: true });
                // Notify the popup to refresh the list
                chrome.runtime.sendMessage({
                    action: "showMessage",
                    message: "Snippet saved successfully!",
                    type: "success",
                });
            });
        });
        return true; // Indicates that the response is asynchronous
    }
});
