// Get a reference to the database service
let database = firebase.database();

firebase.auth().onAuthStateChanged(firebaseUser => {
  let user = firebase.auth().currentUser;
  if (user !== null) {
    user.updateProfile({
      displayName: user.displayName
    });
    document.getElementById('welcome').innerHTML = `Bienvenid@ ${user.displayName} <span class="caret"></span>`;
    document.getElementById('user-name').innerHTML = `${user.displayName}`;
    const userPhoto = user.photoURL;
    if (userPhoto) {
      document.getElementById('profile-image').innerHTML = `<img src="${user.photoURL}" id="avatar">`;
    } else {
      document.getElementById('profile-image').innerHTML = `<img src="${'../images/placeholder-user.png'}" id="avatar">`;
    }
    document.getElementById('user-email').innerHTML = `${user.email}`;
  } else {
    console.log('not logged in');
  }
  let id = user.uid;
  userConect = database.ref('users/' + id);
  addUser(user.displayName, user.email, user.photoURL);
});

addUser = (name, email, photo) => {
  let conect = userConect.push({
    name: name,
    email: email,
    photo: photo
  });
};

// POST A NEW ENTRY FUNCTION
// Get elements
const entryTitle = document.getElementById('entry-title');
const entryText = document.getElementById('new-entry');
const btnPost = document.getElementById('save-entry');
const inputImage = document.getElementById('input-image');

// Save image
const doClickImage = () => {
  console.log('esta entrando');
  let imageFile = document.getElementById('file-image');
  console.log(imageFile);
  if (imageFile) {
    imageFile.click();
  }
  //   const newFileReader = new FileReader();
  //   newFileReader.addEventListener("load", function(e){
  //     const containerImage = document.createElement("div");
  //     const imageElement = document.createElement("img");
  //     const titleElement = document.createElement("h4");

  //     containerImage.classList.add("card");
  //     imageElement.src = e.target.result;
  //     titleElement.innerText = titleImage.value;

  //     containerImage.appendChild(titleElement);
  //     containerImage.appendChild(imageElement);
  //     containerPublic.appendChild(containerImage);
  //     // console.log(e.target.result);
  // }
// };
};

inputImage.addEventListener('click', doClickImage);

const writeNewEntry = () => {
  const currentUser = firebase.auth().currentUser;
  const textInTitle = entryTitle.value;
  const textInEntry = entryText.value;
  if (textInEntry.trim() === '' && textInTitle.trim() === '') {
    swal('No ingreses entradas sin título o texto');
  } else {
    entryTitle.value = '';
    entryText.value = '';

    // A new entry
    const date = (new Date).getTime();

    let entryData = {
      creator: currentUser.uid,
      creatorName: currentUser.displayName,
      title: textInTitle,
      body: textInEntry,
      entryDate: date
    };

    // Create a unique key for messages collection
    const newEntryKey = firebase.database().ref().child('entries').push().key;

    // Write the new entry's data simultaneously in the entry list and the user's entry list.
    let updates = {};

    updates['/entries/' + newEntryKey] = entryData;
    updates['/user-entries/' + currentUser.uid + '/' + newEntryKey] = entryData;

    return firebase.database().ref().update(updates);
  };
};

// Listen to button share
btnPost.addEventListener('click', writeNewEntry);

// LOG-OUT FUNCTION
// Get elements
const btnLogout = document.getElementById('btn-log-out');

// Add logout event
btnLogout.addEventListener('click', event => {
  firebase.auth().signOut();
  window.location.assign('../index.html');
});
