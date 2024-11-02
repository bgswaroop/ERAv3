document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');

  const uploadAudioButton = document.getElementById('uploadAudioButton');
  const processAudioButton = document.getElementById('processAudioButton');

  if (uploadAudioButton) {
      uploadAudioButton.addEventListener('click', uploadAudio);
  } else {
      console.error('Upload audio button not found');
  }

  if (processAudioButton) {
      processAudioButton.addEventListener('click', processAudio);
  } else {
      console.error('Process audio button not found');
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

async function uploadAudio() {
  showLoading();
  console.log('uploadAudio function called');
  const audioInput = document.getElementById('audioInput');
  const file = audioInput.files[0];
  if (!file) {
      alert('Please select an audio file first!');
      return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('/audio/upload', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();
      displayResult('Original Audio:', result.full_content);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the audio.');
  } finally {
      hideLoading();
  }
}

async function processAudio() {
  showLoading();
  console.log('processAudio function called');
  try {
      const response = await fetch('/audio/process', { method: 'POST' });
      const result = await response.json();
      displayResult('Processed Audio:', result.full_content);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing the audio.');
  } finally {
    hideLoading();
  }
}

function displayResult(title, content) {
  const resultArea = document.getElementById('audioResultArea');
  const resultInfo = document.getElementById('audioResultInfo');

  if (resultArea) {
    resultInfo.innerHTML = '';
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
  document.getElementById('audioSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('audioSpinner').style.display = 'none';
}
