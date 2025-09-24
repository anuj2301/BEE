const urlInput = document.getElementById('urlInput');
const shortenButton = document.getElementById('shortenButton');
const shortenedUrl = document.getElementById('shortenedUrl');

shortenButton.addEventListener('click', async () => {
  const originalUrl = urlInput.value;

  const response = await fetch('/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ originalUrl })
  });

  const data = await response.json();

  if (data.error) {
    shortenedUrl.textContent = data.error;
  } else {
    shortenedUrl.textContent = `Shortened URL: ${data.shortUrl}`;
  }
});