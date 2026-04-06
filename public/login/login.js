document
  .getElementById('loginBtn')
  .addEventListener('click', async function () {
    const password = document.getElementById('input').value;

    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      document.getElementById('errorText').innerText = 'Wrong Password!';
      document.getElementById('input').value = '';
    }
  });
