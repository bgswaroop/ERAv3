let allSnippets = [];

document.getElementById('captureBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'captureSnippet' });
  });
});

function refreshSnippetsList() {
  updateAllSnippets(() => {
    displaySnippets();
    updateSelectAllCheckbox();
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showMessage') {
    showMessage(request.message, request.type);
    if (request.message === 'Snippet saved successfully!') {
      refreshSnippetsList();
    }
  }
});

// Modify the displaySnippets function to store all snippets
function displaySnippets() {
  chrome.storage.sync.get('snippets', (data) => {
    allSnippets = data.snippets || [];
    const snippetsDiv = document.getElementById('snippets');
    snippetsDiv.innerHTML = '';

    allSnippets.forEach((snippet, index) => {
      const snippetDiv = document.createElement('div');
      snippetDiv.className = 'snippet';
      snippetDiv.innerHTML = `
          <div class="snippet-header">
            <input type="checkbox" id="snippet-${index}" data-index="${index}">
            <label for="snippet-${index}" class="snippet-title">${snippet.title}</label>
          </div>
          <p>${snippet.text}</p>
          <a href="${snippet.link}" target="_blank">Link to Video</a>
          <span class="timestamp">${snippet.timestamp}</span>
        `;
      snippetsDiv.appendChild(snippetDiv);
    });

    updateSelectAllCheckbox();
  });
}

// Add this function to update the "Select All" checkbox state
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('#snippets input[type="checkbox"]');
  selectAllCheckbox.checked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
}

// Add this function to handle "Select All" checkbox changes
function handleSelectAllChange() {
  const selectAllCheckbox = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('#snippets input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
}

// Add these event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateAllSnippets(() => {
    displaySnippets();
    document.getElementById('selectAll').addEventListener('change', handleSelectAllChange);
  });
});

// Modify existing event listeners to update the "Select All" checkbox
document.getElementById('snippets').addEventListener('change', (event) => {
  if (event.target.type === 'checkbox') {
    updateSelectAllCheckbox();
  }
});


function getSelectedSnippets() {
  const checkboxes = document.querySelectorAll('#snippets input[type="checkbox"]');
  return Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => parseInt(checkbox.dataset.index));
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

document.getElementById('copyBtn').addEventListener('click', () => {
  const selectedIndices = getSelectedSnippets();
  if (selectedIndices.length === 0) {
    showMessage('Please select at least one snippet to copy.', 'warning');
    return;
  }

  const textToCopy = selectedIndices.map(index => {
    const snippet = allSnippets[index];
    return `${snippet.title}\n${snippet.text}\n${snippet.link}\n${snippet.timestamp}\n\n`;
  }).join('');

  navigator.clipboard.writeText(textToCopy).then(() => {
    showMessage('Selected snippets copied to clipboard!', 'success');
  });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const selectedIndices = getSelectedSnippets();
  if (selectedIndices.length === 0) {
    showMessage('Please select at least one snippet to download.', 'warning');
    return;
  }

  const textToDownload = selectedIndices.map(index => {
    const snippet = allSnippets[index];
    return `${snippet.title}\n${snippet.text}\n${snippet.link}\n${snippet.timestamp}\n\n`;
  }).join('');

  const blob = new Blob([textToDownload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'youtube_snippets.txt';
  a.click();
  URL.revokeObjectURL(url);
  showMessage('Selected snippets downloaded!', 'success');
});

// Update the delete function to also update the "Select All" checkbox
document.getElementById('deleteBtn').addEventListener('click', () => {
  const selectedIndices = getSelectedSnippets();
  if (selectedIndices.length === 0) {
    showMessage('Please select at least one snippet to delete.', 'warning');
    return;
  }

  allSnippets = allSnippets.filter((_, index) => !selectedIndices.includes(index));
  chrome.storage.sync.set({ snippets: allSnippets }, () => {
    displaySnippets();
    showMessage('Selected snippets deleted!', 'success');
    updateSelectAllCheckbox();
  });
});

function updateAllSnippets(callback) {
  chrome.storage.sync.get('snippets', (data) => {
    allSnippets = data.snippets || [];
    if (callback) callback();
  });
}

document.addEventListener('DOMContentLoaded', displaySnippets);
