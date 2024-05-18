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
    const error = await response.json();
    alert('Registration failed: ' + error.message);
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
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('profileButton').style.display = 'block';
    loadUser();
    loadGallery();
    loadUsers();
  } else {
    const error = await response.json();
    alert('Login failed: ' + error.message);
  }
};

// Logout Functionality
document.getElementById('logoutButton').onclick = function() {
  localStorage.removeItem('token');
  document.getElementById('upload').style.display = 'none';
  document.getElementById('login').style.display = 'block';
  document.getElementById('logoutButton').style.display = 'none';
  document.getElementById('profileButton').style.display = 'none';
  document.getElementById('userInfo').innerText = '';
  document.getElementById('profile').style.display = 'none';
};

// Profile Navigation
document.getElementById('profileButton').onclick = function() {
  document.getElementById('upload').style.display = 'none';
  document.getElementById('profile').style.display = 'block';
  loadProfile();
};

// Load Profile Information
async function loadProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/user', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const user = await response.json();
    document.getElementById('profileUsername').placeholder = 'New Username';
    document.getElementById('profilePassword').placeholder = 'New Password';
  } else {
    const error = await response.json();
    alert('Failed to fetch profile information: ' + error.message);
  }
}

// Profile Form (Update Username and Password)
document.getElementById('profileForm').onsubmit = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const username = document.getElementById('profileUsername').value;
  const password = document.getElementById('profilePassword').value;

  if (username) {
    const response = await fetch('http://localhost:3000/api/updateProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ username })
    });
    if (response.ok) {
      alert('Username updated successfully');
      document.getElementById('userInfo').innerText = `Welcome, ${username}`;
    } else {
      const error = await response.json();
      alert('Failed to update username: ' + error.message);
    }
  }

  if (password) {
    const response = await fetch('http://localhost:3000/api/updatePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ password })
    });
    if (response.ok) {
      alert('Password updated successfully');
      document.getElementById('profilePassword').value = '';
    } else {
      const error = await response.json();
      alert('Failed to update password: ' + error.message);
    }
  }
};

// Load User Information
async function loadUser() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/user', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const user = await response.json();
    document.getElementById('userInfo').innerText = `Welcome, ${user.username}`;
  } else {
    const error = await response.json();
    alert('Failed to fetch user information: ' + error.message);
  }
}

// Load All Users
async function loadUsers() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/users', {
    headers: {
      'Authorization': 'Bearer ' + token
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
    const error = await response.json();
    alert('Failed to fetch users: ' + error.message);
  }
}

// Upload Photo Form
document.getElementById('uploadForm').onsubmit = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const photo = document.getElementById('photo').files[0];
  const formData = new FormData();
  formData.append('photo', photo);
  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    body: formData
  });
  if (response.ok) {
    alert('Photo uploaded successfully!');
    loadGallery();
  } else {
    alert('Failed to upload photo: ' + response.statusText);
  }
};

async function loadGallery() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/photos', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const photos = await response.json();
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    photos.forEach(photo => {
      const imgContainer = document.createElement('div');
      const img = document.createElement('img');
      img.src = `http://localhost:3000/uploads/${photo.filename}`;
      img.alt = photo.originalName;
      
      const details = document.createElement('div');
      details.innerText = `Original Name: ${photo.originalName}\nUpload Date: ${new Date(photo.uploadDate).toLocaleString()}`;
      
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.onclick = async () => {
        const deleteResponse = await fetch(`http://localhost:3000/api/photos/${photo._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        if (deleteResponse.ok) {
          alert('Photo deleted successfully');
          loadGallery();
        } else {
          alert('Failed to delete photo');
        }
      };
      imgContainer.appendChild(img);
      imgContainer.appendChild(details);
      imgContainer.appendChild(deleteButton);
      gallery.appendChild(imgContainer);
    });
  } else {
    alert('Failed to fetch photos: ' + response.statusText);
  }
}
