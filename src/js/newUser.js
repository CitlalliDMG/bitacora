// Get elements
const txtName = document.getElementById('txt-name');
const txtEmail = document.getElementById('txt-email');
const txtPassword = document.getElementById('txt-password');
const btnSignUp = document.getElementById('btn-sign-up');

// Add signup event
btnSignUp.addEventListener('click', event => {
  // Get name, email and password
  const email = txtEmail.value;
  const password = txtPassword.value;
  const auth = firebase.auth();
  // Sign in
  const promise = auth.createUserWithEmailAndPassword(email, password);
  console.log(firebase.auth().currentUser);
  promise
    .catch(event =>
      alert(event.message));
});

// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    let user = firebase.auth().currentUser;
    if (user !== null) {
      user.updateProfile({
        displayName: txtName.value
      });
      window.location.assign('../views/home.html');
    }
  } else {
    console.log('not logged in');
  }
});


