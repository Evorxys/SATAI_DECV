let recognition;
let recognizing = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        document.getElementById('speak-button').textContent = 'Stop';
    };

    recognition.onerror = function(event) {
        if (event.error === 'no-speech' || event.error === 'aborted') {
            console.warn('Speech recognition error:', event.error);
        } else {
            console.error('Speech recognition error:', event.error);
        }
    };

    recognition.onend = function() {
        recognizing = false;
        document.getElementById('speak-button').textContent = 'Speak';
    };

    recognition.onresult = function(event) {
        const interimMessageElement = document.getElementById('interim-message');
        if (interimMessageElement) {
            interimMessageElement.remove();
        }
        const speechResult = event.results[0][0].transcript;
        document.getElementById('message-input').value = speechResult;
    };
}

function toggleSpeechRecognition() {
    if (recognizing) {
        recognition.stop();
        return;
    }
    recognition.start();
}

function displayMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    let lastMessageBubble = chatMessages.lastElementChild;
    if (lastMessageBubble && lastMessageBubble.textContent.startsWith(`${username}:`)) {
        lastMessageBubble.textContent = `${username}: ${message}`;
    } else {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message-bubble');
        if (position === 'student') {
            newMessage.classList.add('student');
        }
        newMessage.textContent = `${username}: ${message}`;
        chatMessages.appendChild(newMessage);
    }
    saveMessagesToLocalStorage();
}

function displayInterimMessage(message) {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        const interimMessageElement = document.createElement('div');
        interimMessageElement.id = 'interim-message';
        interimMessageElement.textContent = message;
        messageInput.parentElement.appendChild(interimMessageElement);
    }
}

function sendMessage(message) {
    const room = localStorage.getItem('room');
    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message, username: username, position: position, room: room })
    }).then(response => response.json()).then(data => {
        if (data.status !== 'success') {
            alert('Failed to send message');
        }
    });
}

function sendInterimMessage(interimTranscript) {
    const room = localStorage.getItem('room');
    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: interimTranscript, username: username, position: position, room: room })
    }).then(response => response.json()).then(data => {
        if (data.status !== 'success') {
            console.error('Failed to send interim message');
        }
    });
}
