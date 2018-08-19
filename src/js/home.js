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

const entryList = document.getElementById('new-entries');
let refEntry;
const init = () => {
  let userUid = firebase.auth().currentUser.uid;
  refEntry = firebase.database().ref().child('user-entries/' + userUid);
  getPostOfFirebase();
};

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

  timeToDate = `${day} / ${month} / ${year} a las ${hours} : ${minutes}`;
  return timeToDate;
};

const createNewEntryElement = (entryTitle, entryBody, creator, datePost) => {
  // Crea los elementos que aparecen en el DOM
  const listItem = document.createElement('div');
  const title = document.createElement('p');
  const date = document.createElement('p');
  const body = document.createElement('p');
  const deleteButton = document.createElement('button');
  const time = datePost; // Get the time in miliseconds from post data
  const timeToDate = getTimeToDate(time); // Convert the time to string in format UTC

  // Asigna clase a la area de texto para editar
  listItem.className = 'entry-card';
  title.className = 'entry-name titles';
  body.className = 'editMode';
  date.className = 'dateString';

  // Asignación de texto y clase a botones
  deleteButton.innerHTML = 'Borrar';
  deleteButton.className = 'delete';
  title.innerHTML = `${entryBody}`;
  body.innerHTML = entryTitle;
  date.innerHTML = `${timeToDate} <hr>`;

  // Añadiendo elementos al DOM
  listItem.appendChild(title);
  listItem.appendChild(date);
  listItem.appendChild(body);
  listItem.appendChild(deleteButton);
  return listItem;
};

const addEntry = (key, entryCollection) => {
  const listItem = createNewEntryElement(entryCollection.title, entryCollection.body, entryCollection.creator, entryCollection.entryDate);
  listItem.setAttribute('data-keyentry', key);
  entryList.insertBefore(listItem, entryList.childNodes[0]);
  bindEntryEvents(listItem);
};

const bindEntryEvents = (entryListItem) => {
  const deleteButton = entryListItem.querySelector('button.delete');
  deleteButton.addEventListener('click', deleteEntry);
};

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

const getPostOfFirebase = () => {
  refEntry.on('value', (snapshot) => {
    entryList.innerHTML = '';
    const dataEntry = snapshot.val();
    for (let key in dataEntry) {
      addEntry(key, dataEntry[key]);
    }
  });
};
