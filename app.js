document.getElementById("registerForm").onsubmit = async function (event) {
  event.preventDefault();
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const response = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    alert("User registered successfully!");
  } else {
    const error = await response.json();
    alert("Registration failed: " + error.message);
  }
};

document.getElementById("loginForm").onsubmit = async function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.token);
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none"; // Hide the register section
    document.getElementById("homeMenu").style.display = "none"; // Hide the home menu
    document.getElementById("upload").style.display = "block";
    document.getElementById("homeNavButton").style.display = "block";
    document.getElementById("profileNavButton").style.display = "block";
    document.getElementById("uploadNavButton").style.display = "block";
    document.getElementById("searchNavButton").style.display = "block";
    document.getElementById("logoutNavButton").style.display = "block";
    loadUser();
    loadGallery();
  } else {
    const error = await response.json();
    alert("Login failed: " + error.message);
  }
};

document.getElementById("logoutNavButton").onclick = function () {
  localStorage.removeItem("token");
  document.getElementById("upload").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("register").style.display = "block"; // Show the register section
  document.getElementById("profileNavButton").style.display = "none";
  document.getElementById("uploadNavButton").style.display = "none";
  document.getElementById("searchNavButton").style.display = "none";
  document.getElementById("logoutNavButton").style.display = "none";
  document.getElementById("userInfo").innerText = "";
  document.getElementById("profilePictureDisplay").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("homeMenu").style.display = "block"; // Show the home menu
};

document.getElementById("homeNavButton").onclick = function () {
  document.getElementById("upload").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("homeMenu").style.display = "block";
};

document.getElementById("profileNavButton").onclick = function () {
  document.getElementById("upload").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("profile").style.display = "block";
  document.getElementById("about").style.display = "none";
  document.getElementById("homeMenu").style.display = "none";
  loadProfile();
  loadProfilePicture(); // Ensure profile picture is loaded
};

document.getElementById("uploadNavButton").onclick = function () {
  document.getElementById("upload").style.display = "block";
  document.getElementById("profile").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("about").style.display = "none";
  document.getElementById("homeMenu").style.display = "none";
  loadGallery();
};

document.getElementById("searchNavButton").onclick = function () {
  document.getElementById("upload").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("search").style.display = "block";
  document.getElementById("about").style.display = "none";
  document.getElementById("homeMenu").style.display = "none";
};

document.getElementById("aboutNavButton").onclick = function () {
  document.getElementById("upload").style.display = "none";
  document.getElementById("profile").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("about").style.display = "block";
  document.getElementById("homeMenu").style.display = "none";
};

document.getElementById("profileForm").onsubmit = async function (event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const username = document.getElementById("profileUsername").value;
  const password = document.getElementById("profilePassword").value;

  let response;

  if (username) {
    response = await fetch("http://localhost:3000/api/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ username }),
    });
    if (response.ok) {
      alert("Username updated successfully");
      document.getElementById("userInfo").innerText = `Welcome, ${username}`;
    } else {
      const error = await response.json();
      alert("Failed to update username: " + error.message);
    }
  }

  if (password) {
    response = await fetch("http://localhost:3000/api/updatePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      alert("Password updated successfully");
      document.getElementById("profilePassword").value = "";
    } else {
      const error = await response.json();
      alert("Failed to update password: " + error.message);
    }
  }
};

document.getElementById("profilePictureForm").onsubmit = async function (
  event
) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const profilePicture = document.getElementById("profilePicture").files[0];
  const formData = new FormData();
  formData.append("profilePicture", profilePicture);
  const response = await fetch(
    "http://localhost:3000/api/user/profilePicture",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    }
  );
  if (response.ok) {
    alert("Profile picture updated successfully");
    loadProfilePicture();
  } else {
    alert("Failed to update profile picture: " + response.statusText);
  }
};

document.getElementById("uploadForm").onsubmit = async function (event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const photo = document.getElementById("photo").files[0];
  const description = document.getElementById("description").value;
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("description", description);
  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });
  if (response.ok) {
    alert("Photo uploaded successfully!");
    loadGallery();
  } else {
    alert("Failed to upload photo: " + response.statusText);
  }
};

document.getElementById("searchForm").onsubmit = async function (event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const query = document.getElementById("searchQuery").value;
  const response = await fetch(
    `http://localhost:3000/api/search?query=${query}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    const photos = await response.json();
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";
    photos.forEach((photo) => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "photo-container";

      const img = document.createElement("img");
      img.src = `http://localhost:3000/uploads/${photo.filename}`;
      img.alt = photo.originalName;

      const details = document.createElement("div");
      details.innerHTML = `Description: ${photo.description}\nOriginal Name: ${
        photo.originalName
      }\nUpload Date: ${new Date(photo.uploadDate).toLocaleString()}`;

      imgContainer.appendChild(img);
      imgContainer.appendChild(details);
      searchResults.appendChild(imgContainer);
    });
  } else {
    alert("Failed to search photos: " + response.statusText);
  }
};

async function loadProfile() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/user", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (response.ok) {
    const user = await response.json();
    document.getElementById("profileUsername").placeholder = "New Username";
    document.getElementById("profilePassword").placeholder = "New Password";
  } else {
    const error = await response.json();
    alert("Failed to fetch profile information: " + error.message);
  }
}

async function loadProfilePicture() {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "http://localhost:3000/api/user/profilePicture",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    const profilePictureDisplay = document.getElementById(
      "profilePictureDisplay"
    );
    profilePictureDisplay.src = objectURL;
    profilePictureDisplay.style.display = "block";
  } else {
    alert("Failed to fetch profile picture: " + response.statusText);
  }
}

async function loadUser() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/user", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (response.ok) {
    const user = await response.json();
    document.getElementById("userInfo").innerText = `Welcome, ${user.username}`;
    const profilePictureDisplay = document.getElementById(
      "profilePictureDisplay"
    );
    profilePictureDisplay.src =
      user.profilePicture && user.profilePicture !== "cat1.png"
        ? `http://localhost:3000/uploads/${user.profilePicture}`
        : `http://localhost:3000/uploads/defaultProfilePicture`;
    profilePictureDisplay.style.display = "block";
  } else {
    const error = await response.json();
    alert("Failed to fetch user information: " + error.message);
  }
}

async function loadGallery() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/photos", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (response.ok) {
    const photos = await response.json();
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    photos.forEach((photo) => {
      const imgContainer = document.createElement("div");
      imgContainer.className = "photo-container";

      const img = document.createElement("img");
      img.src = `http://localhost:3000/uploads/${photo.filename}`;
      img.alt = photo.description;

      const details = document.createElement("div");
      details.className = "photo-details";
      details.innerHTML = `
        <p>Description: ${photo.description}</p>
        <p>Original Name: ${photo.originalName}</p>
        <p>Upload Date: ${new Date(photo.uploadDate).toLocaleString()}</p>
      `;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.innerText = "Delete";
      deleteButton.onclick = async () => {
        const deleteResponse = await fetch(
          `http://localhost:3000/api/photos/${photo._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        if (deleteResponse.ok) {
          alert("Photo deleted successfully");
          loadGallery();
        } else {
          alert("Failed to delete photo");
        }
      };

      details.appendChild(deleteButton);

      const likesDiv = document.createElement("div");
      likesDiv.className = "likes";

      const likeButton = document.createElement("button");
      likeButton.className = "like-button";
      likeButton.innerText = "Like";
      likeButton.onclick = async () => {
        const likeResponse = await fetch(
          `http://localhost:3000/api/photos/${photo._id}/like`,
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        if (likeResponse.ok) {
          alert("Photo liked successfully");
          loadLikes(photo._id, likesDiv);
        } else {
          alert("Failed to like photo");
        }
      };

      const likeCount = document.createElement("span");
      likeCount.className = "like-count";
      likesDiv.appendChild(likeButton);
      likesDiv.appendChild(likeCount);
      details.appendChild(likesDiv);

      const commentsDiv = document.createElement("div");
      commentsDiv.className = "comments";

      const commentForm = document.createElement("form");
      commentForm.className = "comment-form";
      commentForm.innerHTML = `
        <input type="text" class="comment-input" placeholder="Add a comment">
        <button type="submit" class="comment-submit">Comment</button>
      `;
      commentForm.onsubmit = async function (event) {
        event.preventDefault();
        const commentInput = commentForm.querySelector(".comment-input").value;
        const response = await fetch(
          `http://localhost:3000/api/photos/${photo._id}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ comment: commentInput }),
          }
        );
        if (response.ok) {
          alert("Comment added successfully");
          loadComments(photo._id, commentsDiv);
        } else {
          alert("Failed to add comment");
        }
      };

      commentsDiv.appendChild(commentForm);

      const commentList = document.createElement("div");
      commentList.className = "comment-list";
      commentsDiv.appendChild(commentList);

      details.appendChild(commentsDiv);
      imgContainer.appendChild(img);
      imgContainer.appendChild(details);
      gallery.appendChild(imgContainer);

      loadComments(photo._id, commentsDiv);
      loadLikes(photo._id, likesDiv);
    });
  } else {
    alert("Failed to fetch photos: " + response.statusText);
  }
}

async function loadLikes(photoId, likesDiv) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:3000/api/photos/${photoId}/likes`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    const likeCount = await response.json();
    const likeSpan = likesDiv.querySelector(".like-count");
    likeSpan.innerText = likeCount;
  } else {
    alert("Failed to fetch likes: " + response.statusText);
  }
}

async function loadComments(photoId, commentsDiv) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:3000/api/photos/${photoId}/comments`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    const comments = await response.json();
    const commentList = commentsDiv.querySelector(".comment-list");
    commentList.innerHTML = "";
    comments.forEach((comment) => {
      const commentDiv = document.createElement("div");
      commentDiv.className = "comment";
      commentDiv.innerText = `${comment.comment} - ${new Date(
        comment.date
      ).toLocaleString()}`;
      commentList.appendChild(commentDiv);
    });
  } else {
    alert("Failed to fetch comments: " + response.statusText);
  }
}

document.getElementById("toggleDarkMode").onclick = function () {
  document.body.classList.toggle("dark-mode");
};
