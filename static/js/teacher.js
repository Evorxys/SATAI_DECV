document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message.trim() !== '') {
        sendMessage(message);
        updateMessageBubble(message);
        messageInput.value = '';
        saveMessagesToLocalStorage();
    }
});

document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('teacher-messages').innerHTML = '';
    document.getElementById('student-messages').innerHTML = '';
    localStorage.removeItem('teacherMessages');
    localStorage.removeItem('studentMessages');
});

document.getElementById('save-button').addEventListener('click', function() {
    const room = localStorage.getItem('room');
    fetch(`/get_teacher_messages?room=${room}`).then(response => response.json()).then(data => {
        if (data.messages) {
            let teacherMessages = '';
            data.messages.forEach(msg => {
                teacherMessages += `${msg[0]}: ${msg[1]}\n`; // msg[0] is username, msg[1] is message
            });
            const blob = new Blob([teacherMessages], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'teacher_chat.txt';
            link.click();
        } else {
            alert('No teacher messages found.');
        }
    }).catch(error => {
        console.error('Error fetching teacher messages:', error);
        alert('Failed to fetch teacher messages.');
    });
});

document.getElementById('print-button').addEventListener('click', function() {
    const room = localStorage.getItem('room');
    fetch(`/get_teacher_messages?room=${room}`).then(response => response.json()).then(data => {
        if (data.messages) {
            let printContent = '<h1>Speech and Action to Text using A.I.</h1>';
            data.messages.forEach(msg => {
                printContent += `<p><strong>${msg[0]}:</strong> ${msg[1]}</p>`; // msg[0] is username, msg[1] is message
            });
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Speech and Action to Text using A.I.</title></head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('No teacher messages found.');
        }
    }).catch(error => {
        console.error('Error fetching teacher messages:', error);
        alert('Failed to fetch teacher messages.');
    });
});

document.getElementById('speak-button').addEventListener('click', function() {
    toggleSpeechRecognition();
});

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
}

function sendMessage(message) {
    const room = localStorage.getItem('room');
    addMessageToDatabase(message, username, position, room);
    const newMessage = document.createElement('div');
    newMessage.classList.add('message-bubble');
    if (position === 'teacher') {
        newMessage.classList.add('teacher');
        document.getElementById('teacher-messages').appendChild(newMessage);
    }
    newMessage.textContent = `${username}: ${message}`;
    saveMessagesToLocalStorage();
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
    const teacherMessages = document.getElementById('teacher-messages');
    let lastMessageBubble = teacherMessages.lastElementChild;
    if (lastMessageBubble && lastMessageBubble.textContent.startsWith(`${username}:`)) {
        lastMessageBubble.textContent = `${username}: ${message}`;
    } else {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message-bubble');
        if (position === 'teacher') {
            newMessage.classList.add('teacher');
        }
        newMessage.textContent = `${username}: ${message}`;
        teacherMessages.appendChild(newMessage);
    }
}

loadMessagesFromLocalStorage();
loadMessages();
setInterval(loadMessages, 5000);

/* ...existing code... */
