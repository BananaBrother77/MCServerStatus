const secretHash =
  '8ac3aa1df209d3cb7acb72b2aee314b931757cda118193e1a26e75aefb45293c';
const loginBtn = document.getElementById('loginBtn');
const errorText = document.getElementById('errorText');

loginBtn.addEventListener('click', checkPassword);

function checkPassword() {
  const userInput = document.getElementById('input').value;
  const userHash = CryptoJS.SHA256(userInput).toString();

  if (userHash === secretHash) {
    sessionStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/index.html'
  } else {
    errorText.textContent = 'Wrong password!';
  }
}
