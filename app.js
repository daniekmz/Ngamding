// Chat Functions
function initializeChat() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    // Send message
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('chat-name').value;
        const message = document.getElementById('chat-message').value;
        
        if (name && message) {
            try {
                await db.collection("messages").add({
                    name: name,
                    message: message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                document.getElementById('chat-message').value = '';
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    });

    // Receive messages
    db.collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
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

// File Upload Functions
function initializeFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const uploadButton = document.getElementById('upload-button');
    const fileList = document.getElementById('file-list');

    // Upload file to Firebase Storage
    uploadButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        
        if (file) {
            try {
                const storageRef = storage.ref(`uploads/${file.name}`);
                const uploadTask = storageRef.put(file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress}%`);
                    },
                    (error) => {
                        console.error("Upload error:", error);
                    },
                    async () => {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        await db.collection("files").add({
                            name: file.name,
                            size: file.size,
                            url: downloadURL,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        fileInput.value = '';
                        loadFiles();
                    }
                );
            } catch (error) {
                console.error("Upload failed:", error);
            }
        }
    });

    // Load files from Firestore
    async function loadFiles() {
        fileList.innerHTML = '<div class="file-list-header"><span>File Name</span><span>Size</span><span>Action</span></div>';
        
        const snapshot = await db.collection("files").orderBy("timestamp", "desc").get();
        snapshot.forEach(doc => {
            const file = doc.data();
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span>${(file.size / 1024).toFixed(2)} KB</span>
                <a href="${file.url}" download="${file.name}" class="download-btn">
                    <i class="fas fa-download"></i>
                </a>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // Initial load
    loadFiles();
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    initializeFileUpload();
    
    // Toggle Chat Section
    document.getElementById('open-chat').addEventListener('click', () => {
        document.getElementById('chat-section').classList.toggle('active');
    });
});