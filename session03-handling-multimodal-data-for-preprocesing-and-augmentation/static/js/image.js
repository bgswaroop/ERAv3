document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');

  const uploadImageButton = document.getElementById('uploadImageButton');
  const preprocessImageButton = document.getElementById('preprocessImageButton');
  const augmentImageButton = document.getElementById('augmentImageButton');

  if (uploadImageButton) {
      uploadImageButton.addEventListener('click', uploadImage);
  } else {
      console.error('Upload image button not found');
  }

  if (preprocessImageButton) {
      preprocessImageButton.addEventListener('click', preprocessImage);
  } else {
      console.error('Preprocess image button not found');
  }

  if (augmentImageButton) {
      augmentImageButton.addEventListener('click', augmentImage);
  } else {
      console.error('Augment image button not found');
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

async function uploadImage() {
  showLoading();
  console.log('uploadImage function called');
  const imageInput = document.getElementById('imageInput');
  const file = imageInput.files[0];
  if (!file) {
      alert('Please select an image first!');
      return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('/image/upload', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();
      displayResult('Original Image:', result.file_url);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the image.');
  } finally {
      hideLoading();
  }
}

async function preprocessImage() {
  showLoading();
  console.log('preprocessImage function called');
  try {
      const response = await fetch('/image/preprocess', { method: 'POST' });
      const result = await response.json();
      displayResult('Preprocessed Image:', result.full_content);
      document.getElementById('imageResultInfo').innerText = result.message;
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while preprocessing the image.');
  } finally {
      hideLoading();
  }
}

async function augmentImage() {
  showLoading();
  console.log('augmentImage function called');
  try {
      const response = await fetch('/image/augment', { method: 'POST' });
      const result = await response.json();
      displayResult('Augmented Image:', result.full_content);
      document.getElementById('imageResultInfo').innerText = result.message;
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while augmenting the image.');
  } finally {
      hideLoading();
  }
}

function displayResult(title, content) {
  const resultArea = document.getElementById('imageResultArea');
  const resultInfo = document.getElementById('imageResultInfo');

  if (resultArea) {
    resultInfo.innerHTML = '';
    resultArea.innerHTML = `<h3>${title}</h3><img src="${content}" alt="${title}" />`;
  } else {
      console.error('Result area not found');
  }
}

function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/<//g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function showLoading() {
  document.getElementById('imageSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('imageSpinner').style.display = 'none';
}
