// Registration Form
document.getElementById('registerForm').onsubmit = async function(event) {
  event.preventDefault();
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  if (response.ok) {
    alert('User registered successfully!');
  } else {
    alert('Registration failed');
  }
};

// Login Form
document.getElementById('loginForm').onsubmit = async function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    console.log('JWT Token:', data.token); // Log the token to the console
    document.getElementById('login').style.display = 'none';
    document.getElementById('upload').style.display = 'block';
    loadUser();
    loadGallery();
    loadUsers();
  } else {
    alert('Login failed');
  }
};

// Load User Information
async function loadUser() {
  const response = await fetch('http://localhost:3000/api/user', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
  if (response.ok) {
    const user = await response.json();
    document.getElementById('user').innerText = `Welcome, ${user.username}`;
  } else {
    alert('Failed to fetch user information');
  }
}

// Load All Users
async function loadUsers() {
  const response = await fetch('http://localhost:3000/api/users', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
  if (response.ok) {
    const users = await response.json();
    const usersDiv = document.getElementById('users');
    usersDiv.innerHTML = '';
    users.forEach(user => {
      const userDiv = document.createElement('div');
      userDiv.innerText = user.username;
      usersDiv.appendChild(userDiv);
    });
  } else {
    alert('Failed to fetch users');
  }
}

// Upload Photo Form
document.getElementById('uploadForm').onsubmit = async function(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('photo', document.getElementById('photo').files[0]);
  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  });
  if (response.ok) {
    alert('Photo uploaded successfully!');
    loadGallery();
  } else {
    alert('Failed to upload photo.');
  }
};

async function loadGallery() {
  const response = await fetch('http://localhost:3000/api/photos', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
  const photos = await response.json();
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = `http://localhost:3000/uploads/${photo.filename}`;
    img.alt = photo.originalName;
    gallery.appendChild(img);
  });
}
