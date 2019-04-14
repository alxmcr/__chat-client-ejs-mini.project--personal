// API: parameters
const HOST = '127.0.0.1';
const PORT = 9090;

// 1. CHAT
let chat = {};

// 2. Socket.io: Namespaces
let namespaceCurrentObject = {};

// 3. Socket.io: Rooms
let roomCurrentObject = {};

// 4. Namespaces
let allAppNamespaces = {};

// INIT
initApp();

// Handler: Messenger
handlerMessenger();

// Handler: Namespace
handlerAddNamespace();

// Handler: Room
handlerAddRoom();

async function initApp() {

    // Get the namespaces
    allAppNamespaces = await getNamespaces(HOST, PORT);

    cleanHTMLHeaderListNamespaces();
    cleanHTMLHeaderListRooms();

    if (allAppNamespaces.length > 0) {
        //console.log('allAppNamespaces', allAppNamespaces);

        // HTML: Clean
        generateHTMLHeaderListNamespaces(allAppNamespaces);
        generateHTMLListNamespaces(allAppNamespaces);

        // NAMESPACE: default
        const namespaceForDefault = allAppNamespaces[0];

        // Current
        namespaceCurrentObject = namespaceForDefault;

        // Build App with Socket.io
        buildApp(namespaceForDefault);
    } else {
        console.log('Error, there are not any namespace');
    }
}

function buildApp(namespaceObj) {
    // console.log('namespaceObj', namespaceObj);

    // ID Namespace
    const idNS = namespaceObj.id;

    // Socket.io: Connect to namespace
    const socket = connectToNamespace(namespaceObj);
    // console.log(`socket ${idNS}`, socket);
    // console.log(`typeof socket ${idNS}`, typeof socket);
    // console.log(`socket.connected`, socket.connected);
    // console.log(`socket.io`, socket.io);
    // console.log(`socket.json`, socket.json);

    // Emit 
    socket.emit('get-list-rooms', idNS);

    // Listen
    socket.on('get-list-rooms', generateHTMLListRooms);
}

function generateHTMLListNamespaces(namespaces) {

    if (namespaces.length > 0) {
        // Create Header List Namespaces
        generateHTMLHeaderListNamespaces(namespaces);

        // Generate HTML for a item namespaces
        generateHTMLForAllNamespaces(namespaces);

    } else {
        console.log('Error, there are not namespaces...');
    }
}

function generateHTMLListRooms(rooms) {

    if (rooms.length > 0) {
        // Create Header List Rooms
        generateHTMLHeaderListRooms(rooms);

        // Generate HTML for a item room
        generateHTMLForItemRoom(rooms);

    } else {
        console.log('Error, in this namespace there are not rooms...');
    }
}

function generateHTMLForAllNamespaces(namespaces) {
    //console.log('namespaces', namespaces);

    // DOM
    const namespaceList = document.getElementById('namespaces-list');
    namespaceList.innerHTML = '';

    namespaces.forEach(namespace => {
        //console.log(namespace);

        // Generate HTML
        const {
            id,
            name
        } = namespace;

        // DOM
        const li = document.createElement('li');
        li.id = id;
        li.classList.add('namespace-item');
        const a = document.createElement('a');
        a.id = `${id}`;
        a.href = '#';
        a.innerHTML = name;
        a.classList.add('namespace-link');
        a.dataset.namespace = id;

        li.append(a);
        namespaceList.append(li);

        // Events
        a.addEventListener('click', clickNamespace);
    });
}

function generateHTMLForItemRoom(rooms) {
    // console.log('rooms', rooms);

    // DOM
    const roomList = document.getElementById('rooms-list');
    roomList.innerHTML = '';

    rooms.forEach(room => {
        //console.log('room', room);
        const {
            id,
            name,
            idNS
        } = room;

        // DOM
        const li = document.createElement('li');
        li.id = id;
        li.classList.add('room-item');
        const a = document.createElement('a');
        a.id = `${idNS}-${id}`;
        a.href = '#';
        a.innerHTML = name;
        a.classList.add('room-link');
        a.dataset.namespace = idNS;
        a.dataset.room = id;

        li.append(a);
        roomList.append(li);

        // Events
        a.addEventListener('click', clickRoom);
    });
}

function generateHTMLHeaderListNamespaces(allAppNamespaces) {
    const titleListNamespaces = document.getElementById('namespaces-title');
    titleListNamespaces.innerHTML = `Namespaces (${allAppNamespaces.length})`;
    const namespacesList = document.getElementById('namespaces-list');
    namespacesList.innerHTML = '';
}

function generateHTMLHeaderListRooms(rooms) {
    const titleListRooms = document.getElementById('rooms-title');
    titleListRooms.innerHTML = `Rooms (${rooms.length})`;
    const roomsList = document.getElementById('rooms-list');
    roomsList.innerHTML = '';
}

function generateHTMLMessages(messages) {
    // console.log('messages', messages);

    cleanHTMLContainerMessages();

    // Current room
    //console.log('roomCurrentObject', roomCurrentObject);
    const idRoom = roomCurrentObject.id;
    //console.log('idRoom', idRoom);
    const roomName = roomCurrentObject.name;
    //console.log('roomName', roomName);

    const roomTitle = document.getElementById('room-title');
    roomTitle.innerHTML = roomName.toUpperCase();

    // Messenger
    const messenger = document.getElementById('messenger');
    messenger.style.display = 'block';

    if (messages.length > 0) {
        // Remove error messages
        cleanHTMLErrorMessages();

        const roomChat = document.getElementById('room-chat');
        roomChat.innerHTML = '';
        
        messenger.addEventListener('submit', (ev) => {
            ev.preventDefault();
        })

        messages.forEach(message => {
            const messageHTML = generateHTMLForMessage(message);
            roomChat.append(messageHTML);
        });
    } else {
        const errorMSG = `Error, ${roomName} room does not have messages...`;
        console.log(errorMSG);
        generateHTMLErrorMessages(errorMSG);
    }
}

function handlerAddNamespace() {

    // DOM
    const btnAdd = document.getElementById('namespaces-btnAdd');
    // console.log(btnAdd);

    const namespaceForm = document.getElementById('namespace-form');
    // console.log(namespaceForm);

    const btnCreateNS = document.getElementById('namespace-btncreate');
    // console.log(btnCreateNS);

    namespaceForm.addEventListener('submit', ev => {
        ev.preventDefault();
    });

    btnAdd.addEventListener('click', (e) => {
        //  DOM: Container
        const namespaceNew = document.getElementById('namespace-new');
        // console.log(namespaceNew);

        // console.log('namespaceNew.style', namespaceNew.style);
        // console.log('namespaceNew.style.display', namespaceNew.style.display);

        if (namespaceNew.style.display === "none") {
            namespaceNew.style.display = "block";
        } else {
            namespaceNew.style.display = "none";
        }
    })


    btnCreateNS.addEventListener('click', async (ev) => {
        console.log('creating NS');

        // DOM
        const namespaceList = document.getElementById('namespaces-list');

        const TAGnameNS = document.getElementById('namespace-name');
        const nameNS = TAGnameNS.value;
        TAGnameNS.value = '';

        if (nameNS.length > 0) {

            // API: POST new Namespace
            const namespace = await createNewNamespace(nameNS, HOST, PORT);
            console.log('namespace', namespace);

            // Generate HTML
            const {
                id,
                name
            } = namespace;

            // DOM
            const li = document.createElement('li');
            li.id = id;
            li.classList.add('namespace-item');
            const a = document.createElement('a');
            a.id = `${id}`;
            a.href = '#';
            a.innerHTML = name;
            a.classList.add('namespace-link');
            a.dataset.namespace = id;

            li.append(a);
            namespaceList.append(li);

            // Events
            a.addEventListener('click', clickNamespace);
        } else {
            console.log('Please, fill all fields...');
        }

    });
}

function handlerAddRoom() {

    try {



        // DOM
        const btnAdd = document.getElementById('rooms-btnAdd');
        // console.log(btnAdd);

        const roomForm = document.getElementById('room-form');
        // console.log(roomForm);

        const btnCreateRoom = document.getElementById('room-btncreate');
        // console.log(btnCreateRoom);

        roomForm.addEventListener('submit', ev => {
            ev.preventDefault();
        });

        btnAdd.addEventListener('click', (e) => {
            //  DOM: Container
            const roomNew = document.getElementById('room-new');
            // console.log(roomNew);

            // console.log('roomNew.style', roomNew.style);
            // console.log('roomNew.style.display', roomNew.style.display);

            if (roomNew.style.display === "none") {
                roomNew.style.display = "block";
            } else {
                roomNew.style.display = "none";
            }
        })

        btnCreateRoom.addEventListener('click', async (ev) => {
            console.log('creating Room');

            // DOM
            const roomList = document.getElementById('rooms-list');

            // DOM
            const TAGnameRoom = document.getElementById('room-name');
            const nameRoomTag = TAGnameRoom.value;
            TAGnameRoom.value = '';

            // Namespace
            const idCurrentNS = namespaceCurrentObject.id;

            if (nameRoomTag.length > 0) {



                // API: POST new Room
                const room = await createNewRoom(idCurrentNS, nameRoomTag, HOST, PORT);
                console.log('room', room);

                const {
                    id,
                    name,
                    idNS
                } = room;

                // DOM
                const li = document.createElement('li');
                li.id = id;
                li.classList.add('room-item');
                const a = document.createElement('a');
                a.id = `${idNS}-${id}`;
                a.href = '#';
                a.innerHTML = name;
                a.classList.add('room-link');
                a.dataset.namespace = idNS;
                a.dataset.room = id;

                li.append(a);
                roomList.append(li);

                // Events
                a.addEventListener('click', clickRoom);
            } else {
                console.log('Please, fill all fields...');
            }
        });

    } catch (error) {
        console.log('error', error);
    }
}

function handlerMessenger() {

    // Send message
    const btnSendMessage = document.getElementById('messenger-btnsend');

    btnSendMessage.addEventListener('click', (ev) => {

        // Current room
        //console.log('roomCurrentObject', roomCurrentObject);
        const idRoom = roomCurrentObject.id;
        //console.log('idRoom', idRoom);

        // Messenger: Username
        const usernameTAG = document.getElementById('messenger-username');
        const username = usernameTAG.value;
        usernameTAG.value = '';

        // Messenger: Text       
        const textTAG = document.getElementById('messenger-text');
        const text = textTAG.value;
        textTAG.value = '';

        if (username.length > 0 && text.length > 0) {
            // Messenger: Build a message
            const message = {
                username: username,
                text: text,
                idRoom: idRoom
            };
            console.log('message', message);

            // HTML
            const roomChat = document.getElementById('room-chat');
            const messageHTML = generateHTMLForMessage(message);
            roomChat.append(messageHTML);

            // HIDE
            const roomErrors = document.getElementById('room-errors');
            roomErrors.innerHTML = '';
        } else {
            console.log('Please, fill all field of messenger');
        }
    })
}

function generateHTMLErrorMessages(errorMSG) {
    // console.log(errorMSG);
    // Container errors
    const roomErrors = document.getElementById('room-errors');
    roomErrors.innerHTML = '';

    const pError = document.createElement('p');
    pError.classList.add('error-message');
    pError.textContent = errorMSG;

    roomErrors.append(pError);
}

function cleanHTMLErrorMessages() {
    const roomErrors = document.getElementById('room-errors');
    roomErrors.innerHTML = '';
}

function generateHTMLForMessage(message) {

    const {
        id,
        username,
        text,
        idRoom
    } = message;

    const TagMessage = document.createElement('div');
    TagMessage.id = id;
    TagMessage.classList.add('room-message');
    TagMessage.dataset.room = idRoom;

    const usernameTAG = document.createElement('span');
    usernameTAG.classList.add('message-username');
    usernameTAG.innerHTML = username;

    const textTAG = document.createElement('span');
    textTAG.classList.add('message-text');
    textTAG.innerHTML = text;

    TagMessage.append(usernameTAG);
    TagMessage.append(textTAG);

    return TagMessage;
}

function cleanHTMLHeaderListNamespaces() {
    const titleListNamespaces = document.getElementById('namespaces-title');
    titleListNamespaces.innerHTML = `Namespaces (0)`;
    const namespacesList = document.getElementById('namespaces-list');
    namespacesList.innerHTML = '';
}

function cleanHTMLHeaderListRooms() {
    const titleListRooms = document.getElementById('rooms-title');
    titleListRooms.innerHTML = 'Rooms (0)';
    const roomsList = document.getElementById('rooms-list');
    roomsList.innerHTML = '';
}

function cleanHTMLContainerMessages() {

    const roomTitle = document.getElementById('room-title');
    roomTitle.innerHTML = '';

    const roomChat = document.getElementById('room-chat');
    roomChat.innerHTML = '';
}

// Click
async function clickNamespace(e) {
    // console.log(e.target);

    // CLEAN
    cleanHTMLHeaderListRooms();
    cleanHTMLContainerMessages();
    cleanHTMLErrorMessages();
    
    // Messenger
    const messenger = document.getElementById('messenger');
    messenger.style.display = 'none';

    const idNS = e.target.dataset.namespace;
    // console.log('idNS', idNS);

    // API: Get Namespace
    const namespace = await findNamespaceById(idNS, HOST, PORT);
    //console.log('namespace', namespace);

    // Update current namespace
    namespaceCurrentObject = namespace;

    // Socket.io: Connect to namespace
    const socket = connectToNamespace(namespace);
    // console.log(`socket ${idNS}`, socket);
    // console.log(`typeof socket ${idNS}`, typeof socket);
    // console.log(`socket.connected`, socket.connected);
    // console.log(`socket.io`, socket.io);
    // console.log(`socket.json`, socket.json);

    // Emit 
    socket.emit('get-list-rooms', idNS);

    // Listen
    socket.on('get-list-rooms', generateHTMLListRooms);

    socket.on('connect_error', err => {
        console.log(err);
    })
}

function clickRoom(e) {
    // console.log(e.target);

    const nameRoom = e.target.textContent;
    const idRoom = e.target.dataset.room;
    const idNS = e.target.dataset.namespace;

    const room = {
        id: idRoom,
        name: nameRoom,
        idNS: idNS
    };

    // console.log('room', room);

    roomCurrentObject = room;

    // Socket.io
    const socket = connectToNamespace(namespaceCurrentObject);
    // console.log(`socket ${idNS}`, socket);
    // console.log(`typeof socket ${idNS}`, typeof socket);
    // console.log(`socket.connected`, socket.connected);
    // console.log(`socket.io`, socket.io);
    // console.log(`socket.json`, socket.json);

    // EMIT
    socket.emit('join-room', idRoom);

    // ON
    socket.on('get-messages', generateHTMLMessages);
}

// NAMESPACES
function connectToNamespace(namespaceObj) {

    // console.log('namespaceObj', namespaceObj);
    const {
        id,
        host,
        port
    } = namespaceObj;

    const URL_NSP = `http://${host}:${port}/${id}`;
    console.log('URL_NSP', URL_NSP);

    // Socket.io
    var socketNSP = io(URL_NSP);
    // console.log(socketNSP.connected);

    return socketNSP;
}

// API
async function getNamespaces(host, port) {

    let jsonNamespaces = [];

    try {
        // URL
        const resourceNS = 'namespaces';
        const URL_API = `http://${host}:${port}/${resourceNS}`;;
        // console.log('URL_API', URL_API);

        const responseNamespaces = await fetch(URL_API);
        // console.log('responseNamespaces', responseNamespaces);
        jsonNamespaces = await responseNamespaces.json();
        // console.log('jsonNamespaces', jsonNamespaces);
    } catch (error) {
        console.log(error);
    }

    return jsonNamespaces;
}

async function findNamespaceById(idNS, host, port) {
    let jsonNamespace = {};

    try {
        // URL
        const resourceNS = 'namespaces';
        const URLFindNamespaceById = `http://${host}:${port}/${resourceNS}/${idNS}`;
        //console.log('URLFindNamespaceById', URLFindNamespaceById);

        const responseNamespace = await fetch(URLFindNamespaceById);
        // console.log('responseNamespace', responseNamespace);
        jsonNamespace = await responseNamespace.json();
        //console.log('jsonNamespace', jsonNamespace);
    } catch (error) {
        console.log(error);
    }

    //console.log('jsonNamespace', jsonNamespace);
    return jsonNamespace;
}

async function createNewNamespace(name, host, port) {
    let jsonNamespace = {};

    try {
        // URL
        const resourceNS = 'namespaces';
        const URLFindNamespaceById = `http://${host}:${port}/${resourceNS}`;
        //console.log('URLFindNamespaceById', URLFindNamespaceById);

        const responseNamespace = await fetch(URLFindNamespaceById, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                host: host,
                port: port
            })
        });
        //console.log('responseNamespace', responseNamespace);
        jsonNamespace = await responseNamespace.json();
        //console.log('jsonNamespace', jsonNamespace);
    } catch (error) {
        console.log(error);
    }

    //console.log('jsonNamespace', jsonNamespace);
    return jsonNamespace;
}

async function createNewRoom(idNS, name, host, port) {
    let jsonRoom = {};

    try {
        // URL
        const resourceRoom = 'rooms';
        const URLFindRoomById = `http://${host}:${port}/${resourceRoom}`;
        //console.log('URLFindRoomById', URLFindRoomById);

        const responseRoom = await fetch(URLFindRoomById, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                idNS: idNS
            })
        });
        // console.log('responseRoom', responseRoom);
        jsonRoom = await responseRoom.json();
        //console.log('jsonRoom', jsonRoom);
    } catch (error) {
        console.log(error);
    }

    //console.log('jsonRoom', jsonRoom);
    return jsonRoom;
}