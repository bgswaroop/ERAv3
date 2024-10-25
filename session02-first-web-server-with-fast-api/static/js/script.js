document.addEventListener('DOMContentLoaded', () => {
  const showAnimalBtn = document.getElementById('showAnimal');
  const animalImage = document.getElementById('animalImage');
  const fileInput = document.getElementById('fileInput');
  const uploadFileBtn = document.getElementById('uploadFile');
  const fileInfo = document.getElementById('fileInfo');

  showAnimalBtn.addEventListener('click', () => {
      const selectedAnimal = document.querySelector('input[name="animal"]:checked');
      if (selectedAnimal) {
          fetch(`/animal/${selectedAnimal.value}`)
              .then(response => response.json())
              .then(data => {
                  animalImage.innerHTML = `<img src="${data.image_url}" alt="${selectedAnimal.value}">`;
              })
              .catch(error => console.error('Error:', error));
      } else {
          alert('Please select an animal');
      }
  });

  uploadFileBtn.addEventListener('click', () => {
      const file = fileInput.files[0];
      if (file) {
          const formData = new FormData();
          formData.append('file', file);

          fetch('/upload', {
              method: 'POST',
              body: formData
          })
              .then(response => response.json())
              .then(data => {
                  fileInfo.innerHTML = `
                      <p><strong>Name:</strong> ${data.filename}</p>
                      <p><strong>Size:</strong> ${data.file_size} bytes</p>
                      <p><strong>Type:</strong> ${data.content_type}</p>
                  `;
              })
              .catch(error => console.error('Error:', error));
      } else {
          alert('Please select a file to upload');
      }
  });
});