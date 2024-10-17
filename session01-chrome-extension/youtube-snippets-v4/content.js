function captureSnippet() {
  const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer').textContent.trim();
  const player = document.querySelector('video');
  const currentTime = player.currentTime;
  const startTime = Math.max(0, currentTime - 10);

  const subtitles = document.querySelector('.ytp-caption-segment');
  let snippetText = 'Subtitles missing/disabled';

  if (subtitles && subtitles.textContent.trim()) {
    snippetText = subtitles.textContent.trim();
    snippetText = snippetText.split('.').slice(0, 3).join('.') + '.';
  }

  const linkTime = Math.floor(startTime);
  const link = `https://www.youtube.com/watch?v=${new URLSearchParams(window.location.search).get('v')}&t=${linkTime}s`;

  const timestamp = new Date().toLocaleString();

  const snippet = {
    title: videoTitle,
    text: snippetText,
    link: link,
    timestamp: timestamp
  };

  chrome.runtime.sendMessage({ action: 'saveSnippet', snippet }, (response) => {
    if (response.success) {
      console.log('Snippet saved successfully!');
      // // alert('Snippet saved successfully!');
      // chrome.runtime.sendMessage({ 
      //     action: 'showMessage', 
      //     message: 'Snippet saved successfully!',
      //     type: 'success'
      // });
    }
  });
}


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureSnippet') {
    captureSnippet();
  }
});
