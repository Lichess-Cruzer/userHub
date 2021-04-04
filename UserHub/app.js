//Module 1 ----------------------------------------------------

//Our Base URL
const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

//Promise that fetches our User data
function fetchUsers() {
    return fetch(`${ BASE_URL }/users`)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  
    fetchUsers().then(function (data) {
        // console.log(data);
      });
 
//Renders the a User's Card of data to our page
  function renderUser(user) {

    return $(`<div class="user-card">
        <header>
        <h2>${user.name}</h2>
        </header>
        <section class="company-info">
        <p><b>Contact:</b> ${user.email}</p>
        <p><b>Works for:</b> ${user.company.name}</p>
        <p><b>Company creed:</b>${user.company.catchPhrase}</p>
        </section>
        <footer>
        <button class="load-posts">POSTS BY ${user.username}</button>
        <button class="load-albums">ALBUMS BY ${user.username}</button>
        </footer>
    </div>`).data('user', user)
}

// Loop that renders each of the User's Cards to our page
  function renderUserList(userList) {
    $('#user-list').empty()

    userList.forEach(function(user) {
        const userElement = renderUser(user)
        $('#user-list').append(userElement)
    })
}
  

  //Module 2 ----------------------------------------------------

//Fetches our User Album data from URL
function fetchUserAlbumList(userId) {
  return fetchData(
    `${ BASE_URL }/users/${ userId }/albums?_expand=user&_embed=photos`
    );
}

//Renders a single album
function renderAlbum(album) {
  const albumElement = $(`<div class="album-card">
  <header>
    <h3>${album.title}, by ${album.user.username} </h3>
  </header>
  <section class="photo-list">
    <div class="photo-card"></div>
    <div class="photo-card"></div>
    <div class="photo-card"></div>
    <!-- ... -->
  </section>
</div>`)
  // find() looks for photo-list

  //Loops through and appends each photoElement onto our page for user
  const photoList = albumElement.find(".photo-list");
  album.photos.forEach(function (photo) {
    const photoElement = renderPhoto(photo);
    photoList.append(photoElement);
  });

  return albumElement;
}

//Render a signle photo
function renderPhoto(photo) {
  return $(`<div class="photo-card">
  <a href="${photo.url}" target="_blank">
    <img src="${photo.thumbnailURL}">
    <figure>${photo.title}</figure>
  </a>
</div>`);
}

//Render an Array of Albums
function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");

  $("#album-list").empty().addClass("active");

  albumList.forEach(function (album) {
    const albumElement = renderAlbum(album);
    $("#album-list").append(albumElement);
  });
}

//Fetches data from our url and returns for us to use throughout our app
function fetchData(url) {
  return fetch(url)
        .then(function(response) {
            return response.json()
        })
        .catch(function(error) {
          console.log(error)
        })
}

// Module 3 --------------------------------------------------------

//Fetches user posts from our URL
function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}

//Fetches our post comments from our URL
function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}


//Our promise for accessing our comments link on our user posts
function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }

  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

//Renders our post cards for each user
function renderPost(post) {
  return $(`<div class="post-card">
    <header>
      <h3>${ post.title }</h3>
      <h3>--- ${ post.user.username }</h3>
    </header>
    <p>${ post.body }</p>
    <footer>
      <div class="comment-list"></div>
      <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
    </footer>
  </div>`).data('post', post)
}

//Loops through and appends our user cards 
function renderPostList(postList) {
  $('#app section.active').removeClass('active');

  const postListElement = $('#post-list');
  postListElement.empty().addClass('active');

  postList.forEach(function (post) {
    postListElement.append( renderPost(post) );
  });
}

//Ability to open and view our comments for each post, making active and non active depending on the state in which the click is 
function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}



// Listeners --------------------------------------------------------

//Our user posts click
$('#user-list').on('click', '.user-card .load-posts', function () {
   // load elements for this user
  let element = $(this).closest('.user-card').data('user')
  console.log(element)

  //render posts for this user
  fetchUserPosts(element.id)
  .then(function (postList) {
    renderPostList(postList);
  })
});

//Our user albums click
$("#user-list").on("click", ".user-card .load-albums", function () {
  // load albums for this user
  let element = $(this).closest(".user-card").data("user");
  
  // render albums for this user
  fetchUserAlbumList(element.id)
    .then(function (albumList) {
      renderAlbumList(albumList);
  });

});

//Our users comments click
$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');
  const commentListElement = postCardElement.find('.comment-list');

  setCommentsOnPost(post)
    .then(function (post) {
      console.log('building comments for the first time...')
      
      commentListElement.empty();
      post.comments.forEach(function (comment) {
        commentListElement.prepend($(`
          <h3>${ comment.body } --- ${ comment.email }</h3>
        `));
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      console.log('comments previously existed, only toggling...')
      
      toggleComments(postCardElement);
    });
});

//Calls our data 
  function bootstrap() {
    fetchUsers().then(function (data) {
      renderUserList(data);
    });
  
}

  bootstrap();



  // fetchUserAlbumList(1)
  //   .then(renderAlbumList);

    //   fetchUserAlbumList(1)
  //   .then(function (albumList) {
  //     console.log(albumList);
  // });

  fetchUserPosts(1).then(console.log); // why does this work?  Wait, what?  

  fetchPostComments(1).then(console.log); // again, I'm freaking out here! What gives!?

