document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');

  const uploadTextButton = document.getElementById('uploadTextButton');
  const preprocessTextButton = document.getElementById('preprocessTextButton');
  const augmentTextButton = document.getElementById('augmentTextButton');

  if (uploadTextButton) {
      uploadTextButton.addEventListener('click', uploadTextFile);
  } else {
      console.error('Upload button not found');
  }

  if (preprocessTextButton) {
      preprocessTextButton.addEventListener('click', preprocessTextData);
  } else {
      console.error('Preprocess button not found');
  }

  if (augmentTextButton) {
      augmentTextButton.addEventListener('click', augmentTextData);
  } else {
      console.error('Augment button not found');
  }

  console.log('Event listeners added');

  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const mainContent = document.querySelector('.main-content');

  sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      mainContent.classList.toggle('sidebar-open');
  });
});

async function uploadTextFile() {
  showLoading();
  console.log('uploadTextFile function called');
  const fileInput = document.getElementById('textFileInput');
  const file = fileInput.files[0];
  if (!file) {
      alert('Please select a file first!');
      return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('/text/upload', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();
      displayResult('Original Data:', result.full_content, { word_count: result.word_count });
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the file.');
  } finally {
      hideLoading();
  }
}

async function preprocessTextData() {
  showLoading();
  console.log('preprocessTextData function called');
  try {
      const response = await fetch('/text/preprocess', { method: 'POST' });
      const result = await response.json();
      displayResult('Preprocessed Data:', result.full_content, { token_count: result.token_count });
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while preprocessing the data.');
  } finally {
    hideLoading();
  }
}

async function augmentTextData() {
  showLoading();
  console.log('augmentTextData function called');
  try {
      const response = await fetch('/text/augment', { method: 'POST' });
      const result = await response.json();
      displayResult('Augmented Data:', result.full_content, { token_count: result.token_count });
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while augmenting the data.');
  } finally {
    hideLoading();
  }
}

function displayResult(title, content, options = {}) {
  const resultArea = document.getElementById('resultArea');
  const resultInfo = document.getElementById('resultInfo');

  if (resultArea) {
    let optionalInfo = '';
    if (options.word_count !== undefined) {
        optionalInfo += `<span class="info-item">Words count: ${options.word_count}</span>`;
    }
    if (options.token_count !== undefined) {
        optionalInfo += `<span class="info-item">Tokens count: ${options.token_count}</span>`;
    }
    
    resultInfo.innerHTML = optionalInfo;
    resultArea.innerHTML = `<h3>${title}</h3><pre>${escapeHtml(content)}</pre>`;
  } else {
      console.error('Result area not found');
  }
}

function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function showLoading() {
  document.getElementById('spinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('spinner').style.display = 'none';
}
