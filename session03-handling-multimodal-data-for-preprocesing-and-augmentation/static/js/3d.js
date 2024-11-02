document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');

  const upload3dButton = document.getElementById('upload3dButton');
  const process3dButton = document.getElementById('process3dButton');

  if (upload3dButton) {
      upload3dButton.addEventListener('click', upload3d);
  } else {
      console.error('Upload 3D data button not found');
  }

  if (process3dButton) {
      process3dButton.addEventListener('click', process3d);
  } else {
      console.error('Process 3D data button not found');
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

async function upload3d() {
  showLoading();
  console.log('upload3d function called');
  const dataInput = document.getElementById('3dInput');
  const file = dataInput.files[0];
  if (!file) {
      alert('Please select a 3D data file first!');
      return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
      const response = await fetch('/3d/upload', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();
      displayResult('Original 3D Data:', result.full_content);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while uploading the 3D data.');
  } finally {
      hideLoading();
  }
}

async function process3d() {
  showLoading();
  console.log('process3d function called');
  try {
      const response = await fetch('/3d/process', { method: 'POST' });
      const result = await response.json();
      displayResult('Processed 3D Data:', result.full_content);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing the 3D data.');
  } finally {
    hideLoading();
  }
}

function displayResult(title, content) {
  const resultArea = document.getElementById('3dResultArea');
  const resultInfo = document.getElementById('3dResultInfo');

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
       .replace(/<//g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function showLoading() {
  document.getElementById('3dSpinner').style.display = 'block';
}

function hideLoading() {
  document.getElementById('3dSpinner').style.display = 'none';
}
