document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');

  const uploadAudioButton = document.getElementById('uploadAudioButton');
  const preprocessAudioButton = document.getElementById('preprocessAudioButton');
  const augmentAudioButton = document.getElementById('augmentAudioButton');

  if (uploadAudioButton) {
      uploadAudioButton.addEventListener('click', uploadAudio);
  } else {
      console.error('Upload audio button not found');
  }

  if (preprocessAudioButton) {
      preprocessAudioButton.addEventListener('click', preprocessAudio);
  } else {
      console.error('Preprocess audio button not found');
  }

  if (augmentAudioButton) {
      augmentAudioButton.addEventListener('click', augmentAudio);
  } else {
      console.error('Augment audio button not found');
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
      hideLoading();
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
      displayResult('Original Audio:', result.file_url, result.message);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the audio.');
  } finally {
      hideLoading();
  }
}

async function preprocessAudio() {
  showLoading();
  console.log('preprocessAudio function called');
  try {
      const response = await fetch('/audio/preprocess', { method: 'POST' });
      const result = await response.json();
      displayResult('Preprocessed Audio:', result.full_content, result.message);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while preprocessing the audio.');
  } finally {
      hideLoading();
  }
}

async function augmentAudio() {
  showLoading();
  console.log('augmentAudio function called');
  try {
      const response = await fetch('/audio/augment', { method: 'POST' });
      const result = await response.json();
      displayResult('Augmented Audio:', result.full_content, result.message);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while augmenting the audio.');
  } finally {
      hideLoading();
  }
}

function displayResult(title, content, message = '') {
  const resultArea = document.getElementById('audioResultArea');
  const resultInfo = document.getElementById('audioResultInfo');
  const audioPlayer = document.getElementById('audioPlayer');

  if (resultArea && audioPlayer) {
    resultArea.innerHTML = `<h3>${title}</h3>`;
    audioPlayer.src = content;
    audioPlayer.style.display = 'block';
    resultInfo.innerText = message;
  } else {
      console.error('Result area or audio player not found');
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
