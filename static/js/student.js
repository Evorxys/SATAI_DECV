document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message.trim() !== '') {
        sendMessage(message);
        updateMessageBubble(message);
        messageInput.value = '';
        saveMessagesToLocalStorage();
        scrollToBottom();
    }
});

document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('teacher-messages').innerHTML = '';
    document.getElementById('student-messages').innerHTML = '';
    localStorage.removeItem('teacherMessages');
    localStorage.removeItem('studentMessages');
});

document.getElementById('speak-button').addEventListener('click', function() {
    toggleSpeechRecognition();
});

document.getElementById('camera-button').addEventListener('click', function() {
    const cameraView = document.getElementById('camera-view');
    cameraView.style.display = 'block';
    startCamera();
});

document.getElementById('close-camera-button').addEventListener('click', function() {
    const cameraView = document.getElementById('camera-view');
    cameraView.style.display = 'none';
    stopCamera();
});

function startCamera() {
    const video = document.getElementById('camera-stream');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error accessing camera: ", err);
        });
}

function stopCamera() {
    const video = document.getElementById('camera-stream');
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
        track.stop();
    });

    video.srcObject = null;
}

function loadMessages() {
    const room = localStorage.getItem('room');
    fetch(`/get_messages?room=${room}`).then(response => response.json()).then(data => {
        if (data.messages) {
            const teacherMessages = document.getElementById('teacher-messages');
            const studentMessages = document.getElementById('student-messages');
            teacherMessages.innerHTML = '';
            studentMessages.innerHTML = '';
            data.messages.forEach(msg => {
                const newMessage = document.createElement('div');
                newMessage.classList.add('message-bubble');
                if (msg[2] === 'student') {
                    newMessage.classList.add('student');
                    studentMessages.appendChild(newMessage);
                } else {
                    newMessage.classList.add('teacher');
                    teacherMessages.appendChild(newMessage);
                }
                newMessage.textContent = `${msg[0]}: ${msg[1]}`;
            });
            saveMessagesToLocalStorage();
            scrollToBottom();
        }
    });
}

function saveMessagesToLocalStorage() {
    const teacherMessages = document.getElementById('teacher-messages').innerHTML;
    const studentMessages = document.getElementById('student-messages').innerHTML;
    localStorage.setItem('teacherMessages', teacherMessages);
    localStorage.setItem('studentMessages', studentMessages);
}

function loadMessagesFromLocalStorage() {
    const teacherMessages = localStorage.getItem('teacherMessages');
    const studentMessages = localStorage.getItem('studentMessages');
    if (teacherMessages) {
        document.getElementById('teacher-messages').innerHTML = teacherMessages;
    }
    if (studentMessages) {
        document.getElementById('student-messages').innerHTML = studentMessages;
    }
    scrollToBottom();
}

function sendMessage(message) {
    const room = localStorage.getItem('room');
    addMessageToDatabase(message, username, position, room);
    const newMessage = document.createElement('div');
    newMessage.classList.add('message-bubble');
    if (position === 'student') {
        newMessage.classList.add('student');
        document.getElementById('student-messages').appendChild(newMessage);
    }
    newMessage.textContent = `${username}: ${message}`;
    saveMessagesToLocalStorage();
    scrollToBottom();
}

function addMessageToDatabase(message, username, position, room) {
    fetch('/add_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message, username: username, position: position, room: room })
    }).then(response => response.json()).then(data => {
        if (data.status !== 'success') {
            alert('Failed to add message to database');
        }
    });
}

function updateMessageBubble(message) {
    const studentMessages = document.getElementById('student-messages');
    let lastMessageBubble = studentMessages.lastElementChild;
    if (lastMessageBubble && lastMessageBubble.textContent.startsWith(`${username}:`)) {
        lastMessageBubble.textContent = `${username}: ${message}`;
    } else {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message-bubble');
        if (position === 'student') {
            newMessage.classList.add('student');
        }
        newMessage.textContent = `${username}: ${message}`;
        studentMessages.appendChild(newMessage);
    }
}

function scrollToBottom() {
    const studentMessages = document.getElementById('student-messages');
    studentMessages.scrollTop = studentMessages.scrollHeight;
}

loadMessagesFromLocalStorage();
loadMessages();
setInterval(loadMessages, 5000);

/* ...existing code... */
