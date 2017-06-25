var database = firebase.database();
var postsRef = database.ref('posts/');
// postsRef.once('value', function (snapshot) {
// 	snapshot.forEach(function (childSnapshot) {
// 		var childKey = childSnapshot.key;
// 		var childData = childSnapshot.val();
// 		$('.posts').prepend(`<li data-key=${childKey}>${childData.title}</li>`);
// 	});
// });

$('button.btn-sign-in').click(function (e) {
	e.preventDefault();
	//show sign in dialog
	console.log('clicked btn');
	$('#firebaseui-auth-container').toggleClass('hide');
});

var uiConfig = {
	signInSuccessUrl: '/',
	signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ]
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
var initApp = function () {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			// User is signed in.
			$('button.btn-sign-in').hide();
			$('button.compose').show();
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var uid = user.uid;
			var phoneNumber = user.phoneNumber;
			var providerData = user.providerData;
			user.getToken().then(function (accessToken) {
				document.getElementById('sign-in-status').textContent = phoneNumber;
				// document.getElementById('sign-in').textContent = 'Sign out';
				$('#sign-out').html('<button class="sign-out">Sign Out</button>');
        $('.sign-out').click(function (e) {
          e.preventDefault();
        	firebase.auth().signOut().then(function () {
        		// Sign-out successful.
						location.href = '/';
        		console.log('Sign-out successful.');
        	}).catch(function (error) {
        		// An error happened.
        		console.log(error);
        	});
        })
        $('button.compose').click(function (e) {
          e.preventDefault();
          e.stopPropagation();
          // show compose dialog box
          $('.compose-box').show();
        });
        $('button.compose-box-post').click(function (e) {
          e.preventDefault();
          let postTitle = $('.compose-box').find('#title').val();
          var newPostKey = postsRef.child('posts').push().key;
          let newPost = {};
          newPost['/posts/' + newPostKey] = {
            title: postTitle,
            username: phoneNumber
          };
          let updatePromise = writeNewPost(newPost).then(function() {
          $('form input').val('');
          }).catch(function (error){
            alert('Unable to posts');
          });
        })
        function writeNewPost (post) {
          return firebase.database().ref().update(post);
        }
				// document.getElementById('account-details').textContent = JSON.stringify({
				// 	displayName: displayName,
				// 	email: email,
				// 	emailVerified: emailVerified,
				// 	phoneNumber: phoneNumber,
				// 	photoURL: photoURL,
				// 	uid: uid,
				// 	accessToken: accessToken,
				// 	providerData: providerData
				// }, null, '  ');
			});
		} else {
			// User is signed out.
			// document.getElementById('sign-in-status').textContent = 'Signed out';
			// document.getElementById('sign-in').textContent = 'Sign in';
			// document.getElementById('account-details').textContent = 'null';
      $('button.btn-sign-in').show();
		}
	}, function (error) {
		console.log(error);
	});
};

window.addEventListener('load', function () {
	initApp()
});

postsRef.on('child_added', function(data) {
	addNewPost(data.key, data.val().title, data.val().username);
});
function addNewPost(key, title, username) {
  $('.posts').prepend(`<li data-key=${key}>${title}</li>`);
}
postsRef.on('child_changed', function(data) {
  // addNewPost(postElement, data.key, data.val().text, data.val().author);
  let $changedPost = $('.posts').find("[data-key ='" + data.key + "']");
  $changedPost.hide().html(data.val().title).fadeIn(2000);
});
postsRef.on('child_removed', function(data) {
  // addNewPost(postElement, data.key, data.val().text, data.val().author);
  console.log(data.val());
	let $changedPost = $('.posts').find("[data-key ='" + data.key + "']");
	$changedPost.fadeOut(2000).remove();
});
