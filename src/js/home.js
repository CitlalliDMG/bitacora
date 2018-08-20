// Get a reference to the database service
let database = firebase.database();

// Get a reference to the storage service
let storage = firebase.storage();

firebase.auth().onAuthStateChanged(firebaseUser => {
  let user = firebase.auth().currentUser;

  if (user !== null) {
    document.getElementById('welcome').innerHTML = `Bienvenid@ ${user.displayName} <span class="caret"></span>`;
    document.getElementById('user-name').innerHTML = `${user.displayName}`;
    const userPhoto = user.photoURL;
    if (userPhoto) {
      document.getElementById('profile-image').innerHTML = `<img src="${user.photoURL}" id="avatar">`;
    } else {
      document.getElementById('profile-image').innerHTML = `<img src="${'../img/placeholder-user.png'}" id="avatar">`;
    }
    document.getElementById('user-email').innerHTML = `${user.email}`;
    init();
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
const btnPostText = document.getElementById('save-entry');
const btnPostImage = document.getElementById('file-image');
// const inputImage = document.getElementById('input-image');
// const output = document.getElementById('list');

let imageEntry;

// FUNCTIONS FOR ADD AND IMAGE

const publishNewImage = () => {
  imageEntry = document.getElementById('file-image');
  imageEntry.addEventListener('change', uploadImageToFirebase, false);

  storageRef = storage.ref();
};

const uploadImageToFirebase = () => {
  const currentUser = firebase.auth().currentUser;
  let imageToLoad = imageEntry.files[0];
  let uploadTask = storageRef.child('userImages/' + currentUser.uid + '/' + imageToLoad.name).put(imageToLoad);
  // Register three observers:
  // 1. 'state_changed' observer, called any time the state changes
  // 2. Error observer, called on failure
  // 3. Completion observer, called on successful completion
  uploadTask.on('state_changed', function(snapshot) {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
    case firebase.storage.TaskState.PAUSED: // or 'paused'
      console.log('Upload is paused');
      break;
    case firebase.storage.TaskState.RUNNING: // or 'running'
      console.log('Upload is running');
      break;
    }
  }, function(error) {
    // Handle unsuccessful uploads
  }, function() {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
      createNodeInDatabase(imageToLoad.name, downloadURL, currentUser.uid);
    });
  });
};

const createNodeInDatabase = (imageName, url, userUid) => {
  console.log(imageName);
  console.log(url);
  console.log(userUid);

  refEntry = firebase.database().ref().child('user-entries/' + userUid + '/');
  console.log(refEntry);
  const date = (new Date).getTime();
  refEntry.push({
    nombre: imageName,
    url: url,
    date: date
  });
};

// FUNCTIONS FOR ADD A TEXT POST
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
    const newEntryKey = firebase.database().ref().child('user-entries').push().key;

    // Write the new entry's data simultaneously in the entry list and the user's entry list.
    let updates = {};

    // updates['/entries/' + newEntryKey] = entryData;
    updates['/user-entries/' + currentUser.uid + '/' + newEntryKey] = entryData;

    return firebase.database().ref().update(updates);
  };
};

// Get the entries list of the current user
const entryList = document.getElementById('new-entries');
let refEntry;

const init = () => {
  console.log(firebase.auth().currentUser);

  let userUid = firebase.auth().currentUser.uid;
  refEntry = firebase.database().ref().child('user-entries/' + userUid);
  getPostOfFirebase();
};

// Get the date of the post and give format
const getTimeToDate = (time) => {
  let timeToDate = new Date(time);
  let day = timeToDate.getDate();
  let month = timeToDate.getMonth() + 1;
  let year = timeToDate.getFullYear();
  let hours = timeToDate.getHours();
  let minutes = timeToDate.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  };
  if (day < 10) {
    day = '0' + day;
  };

  if (month < 10) {
    month = '0' + month;
  };

  timeToDate = `${day}/${month}/${year} a las ${hours}:${minutes}`;
  return timeToDate;
};

// Function to create the structure of a new entry (only text)
const createNewEntryElement = (entryTitle, entryBody, datePost) => {
  // Crea los elementos que aparecen en el DOM
  const listItem = document.createElement('div');
  const title = document.createElement('p');
  const date = document.createElement('p');
  const body = document.createElement('p');
  const deleteButton = document.createElement('button');
  const time = datePost; // Get the time in miliseconds from post data
  const timeToDate = getTimeToDate(time); // Convert the time to string in format UTC

  // Assign class to the text area to edit
  listItem.className = 'entry-card';
  title.className = 'entry-name titles';
  body.className = 'editMode';
  date.className = 'dateString';

  // Assign text and class to buttons
  deleteButton.innerHTML = 'Borrar';
  deleteButton.className = 'delete';
  title.innerHTML = `${entryTitle}`;
  body.innerHTML = entryBody;
  date.innerHTML = `${timeToDate} <hr>`;

  // Adding elements to the DOM
  listItem.appendChild(title);
  listItem.appendChild(date);
  listItem.appendChild(body);
  listItem.appendChild(deleteButton);
  return listItem;
};

const createNewImageEntry = (imageName, url, entryDate) => {
  // Create elements of DOM
  const listItem = document.createElement('div');
  const title = document.createElement('p');
  const date = document.createElement('p');
  const body = document.createElement('img');
  const deleteButton = document.createElement('button');
  const time = entryDate; // Get the time in miliseconds from post data
  const timeToDate = getTimeToDate(time); // Convert the time to string in format UTC

  // Assign class to the text area to edit
  listItem.className = 'entry-card';
  title.className = 'entry-name titles';
  body.className = 'image col-12';
  date.className = 'dateString';

  // Assign text and class to buttons
  deleteButton.innerHTML = 'Borrar';
  deleteButton.className = 'delete';
  title.innerHTML = `${imageName}`;
  body.setAttribute('src', `${url}`);
  // body.innerHTML = url;
  date.innerHTML = `${timeToDate} <hr>`;

  // Adding elements to the DOM
  listItem.appendChild(title);
  listItem.appendChild(date);
  listItem.appendChild(body);
  listItem.appendChild(deleteButton);
  return listItem;
};

// Function to add a new entry (only text)
const addEntry = (key, entryCollection) => {
  let listItem = '';
  if (entryCollection.title !== undefined) {
    listItem = createNewEntryElement(entryCollection.title, entryCollection.body, entryCollection.entryDate);
  } else if (entryCollection.url !== undefined) {
    listItem = createNewImageEntry(entryCollection.nombre, entryCollection.url, entryCollection.date);
  };
  listItem.setAttribute('data-keyentry', key);
  entryList.insertBefore(listItem, entryList.childNodes[0]);
  bindEntryEvents(listItem);
};

// Function to listen the entry button events
const bindEntryEvents = (entryListItem) => {
  const deleteButton = entryListItem.querySelector('button.delete');
  deleteButton.addEventListener('click', deleteEntry);
};

// Function to delete an entry
const deleteEntry = () => {
  const keyListItem = event.target.parentNode.dataset.keyentry;
  const refEntryToDelete = refEntry.child(keyListItem);
  swal({
    title: '¿Estás segur@?',
    text: 'Esta acción borrará permanentemente la entrada',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff0000',
    cancelButtonColor: '#231F20',
    confirmButtonText: 'Sí, borralo',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      refEntryToDelete.remove();
      swal(
        '¡Listo!',
        'La entrada seleccionada a sido eliminada',
        'success'
      );
    }
  });
};

// Function to read the entries on Firebase Database
const getPostOfFirebase = () => {
  refEntry.on('value', (snapshot) => {
    entryList.innerHTML = '';
    const dataEntry = snapshot.val();
    for (let key in dataEntry) {
      addEntry(key, dataEntry[key]);
    }
  });
};

btnPostText.addEventListener('click', writeNewEntry);
btnPostImage.addEventListener('click', publishNewImage);

// LOG-OUT FUNCTION
// Get elements
const btnLogout = document.getElementById('btn-log-out');

// Add logout event
btnLogout.addEventListener('click', event => {
  firebase.auth().signOut();
  window.location.assign('../index.html');
});
