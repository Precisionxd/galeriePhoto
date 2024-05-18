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

// Home Button Navigation
document.getElementById('homeButton').onclick = function() {
  document.getElementById('upload').style.display = 'block';
  document.getElementById('profile').style.display = 'none';
  document.getElementById('search').style.display = 'none';
  loadGallery();
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
    document.getElementById('homeButton').style.display = 'block'; // Add this line
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('profileButton').style.display = 'block';
    document.getElementById('searchButton').style.display = 'block';
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
  document.getElementById('homeButton').style.display = 'none'; // Add this line
  document.getElementById('logoutButton').style.display = 'none';
  document.getElementById('profileButton').style.display = 'none';
  document.getElementById('searchButton').style.display = 'none';
  document.getElementById('userInfo').innerText = '';
  document.getElementById('profile').style.display = 'none';
  document.getElementById('search').style.display = 'none';
};

// Profile Navigation
document.getElementById('profileButton').onclick = function() {
  document.getElementById('upload').style.display = 'none';
  document.getElementById('search').style.display = 'none';
  document.getElementById('profile').style.display = 'block';
  loadProfile();
};

// Search Navigation
document.getElementById('searchButton').onclick = function() {
  document.getElementById('upload').style.display = 'none';
  document.getElementById('profile').style.display = 'none';
  document.getElementById('search').style.display = 'block';
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

  let response;

  if (username) {
    response = await fetch('http://localhost:3000/api/updateProfile', {
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
    response = await fetch('http://localhost:3000/api/updatePassword', {
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
  const description = document.getElementById('description').value;
  const formData = new FormData();
  formData.append('photo', photo);
  formData.append('description', description);
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

async function loadGallery(page = 1) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/photos?page=${page}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const data = await response.json();
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    data.photos.forEach(photo => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'photo-container';
      
      const img = document.createElement('img');
      img.src = `http://localhost:3000/uploads/${photo.filename}`;
      img.alt = photo.description;
      
      const details = document.createElement('div');
      details.className = 'photo-details';
      details.innerHTML = `
        <p>Description: ${photo.description}</p>
        <p>Original Name: ${photo.originalName}</p>
        <p>Upload Date: ${new Date(photo.uploadDate).toLocaleString()}</p>
      `;
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
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
          loadGallery(page);
        } else {
          alert('Failed to delete photo');
        }
      };
      
      details.appendChild(deleteButton);
      
      // Comments Section
      const commentsDiv = document.createElement('div');
      commentsDiv.className = 'comments';
      
      const commentForm = document.createElement('form');
      commentForm.className = 'comment-form';
      commentForm.innerHTML = `
        <input type="text" class="comment-input" placeholder="Add a comment">
        <button type="submit" class="comment-submit">Comment</button>
      `;
      commentForm.onsubmit = async function(event) {
        event.preventDefault();
        const commentInput = commentForm.querySelector('.comment-input').value;
        const response = await fetch(`http://localhost:3000/api/photos/${photo._id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ comment: commentInput })
        });
        if (response.ok) {
          alert('Comment added successfully');
          loadComments(photo._id, commentsDiv);
        } else {
          alert('Failed to add comment');
        }
      };
      
      commentsDiv.appendChild(commentForm);
      
      const commentList = document.createElement('div');
      commentList.className = 'comment-list';
      commentsDiv.appendChild(commentList);
      
      details.appendChild(commentsDiv);
      imgContainer.appendChild(img);
      imgContainer.appendChild(details);
      gallery.appendChild(imgContainer);
      
      loadComments(photo._id, commentsDiv);
    });
    
    // Pagination
    const pagination = document.createElement('div');
    pagination.classList.add('pagination');
    for (let i = 1; i <= data.totalPages; i++) {
      const pageLink = document.createElement('button');
      pageLink.innerText = i;
      if (i === parseInt(data.currentPage)) {
        pageLink.classList.add('active');
      }
      pageLink.onclick = () => loadGallery(i);
      pagination.appendChild(pageLink);
    }
    gallery.appendChild(pagination);
  } else {
    alert('Failed to fetch photos: ' + response.statusText);
  }
}

async function loadComments(photoId, commentsDiv) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/photos/${photoId}/comments`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const comments = await response.json();
    const commentList = commentsDiv.querySelector('.comment-list');
    commentList.innerHTML = '';
    comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment';
      commentDiv.innerText = `${comment.comment} - ${new Date(comment.date).toLocaleString()}`;
      commentList.appendChild(commentDiv);
    });
  } else {
    alert('Failed to fetch comments: ' + response.statusText);
  }
}

// Search Form
document.getElementById('searchForm').onsubmit = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const query = document.getElementById('searchQuery').value;
  const response = await fetch(`http://localhost:3000/api/search?query=${query}`, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  if (response.ok) {
    const photos = await response.json();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    photos.forEach(photo => {
      const imgContainer = document.createElement('div');
      const img = document.createElement('img');
      img.src = `http://localhost:3000/uploads/${photo.filename}`;
      img.alt = photo.originalName;
      
      const details = document.createElement('div');
      details.innerText = `Description: ${photo.description}\nOriginal Name: ${photo.originalName}\nUpload Date: ${new Date(photo.uploadDate).toLocaleString()}`;
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(details);
      searchResults.appendChild(imgContainer);
    });
  } else {
    alert('Failed to search photos: ' + response.statusText);
  }
};
