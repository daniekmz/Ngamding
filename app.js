// Firebase Chat Functions
function initializeChat() {
    // Function to send a message
    function sendMessage(name, message) {
        db.collection("messages").add({
            name: name,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch((error) => {
            console.error("Error sending message: ", error);
        });
    }

    // Function to display messages
    function displayMessages() {
        db.collection("messages").orderBy("timestamp", "asc").onSnapshot((snapshot) => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = "";
            snapshot.forEach((doc) => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                messageElement.innerHTML = `
                    <strong>${message.name}</strong>
                    <p>${message.message}</p>
                    <small>${new Date(message.timestamp?.toDate()).toLocaleString()}</small>
                `;
                chatMessages.appendChild(messageElement);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Submit Chat Form
    document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('chat-name').value;
        const message = document.getElementById('chat-message').value;
        if (name && message) {
            sendMessage(name, message);
            document.getElementById('chat-message').value = '';
        }
    });

    displayMessages();
}

// File Upload Functionality
function initializeFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const uploadButton = document.getElementById('upload-button');
    const fileList = document.getElementById('file-list');
    
    uploadButton.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <span>${file.name}</span>
                    <span>${(file.size / 1024).toFixed(2)} KB</span>
                    <a href="${e.target.result}" download="${file.name}" class="download-btn">
                        <i class="fas fa-download"></i>
                    </a>
                `;
                fileList.appendChild(fileItem);
            };
            
            reader.readAsDataURL(file);
            fileInput.value = '';
        }
    });
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    initializeFileUpload();
    
    // Toggle Chat Section
    document.getElementById('open-chat').addEventListener('click', () => {
        const chatSection = document.getElementById('chat-section');
        chatSection.classList.toggle('active');
    });
});