// Initialize Chat
function initChat() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatForm || !chatMessages) return;

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
                alert("Failed to send message. Please try again.");
            }
        }
    });

    // Load messages
    db.collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                displayMessage(message);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

function displayMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <strong>${message.name}</strong>
        <p>${message.message}</p>
        <small>${message.timestamp?.toDate().toLocaleString()}</small>
    `;
    chatMessages.appendChild(messageElement);
}

// Initialize File Upload
function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const dropZone = document.getElementById('drop-zone');
    const fileList = document.getElementById('file-list');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');

    // Drag & drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = var(--primary-btn);
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = var(--accent-color);
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload(files[0]);
        }
    });

    // Click handler
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileUpload(file);
    });

    async function handleFileUpload(file) {
        try {
            const storageRef = storage.ref(`uploads/${Date.now()}_${file.name}`);
            const uploadTask = storageRef.put(file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                },
                (error) => {
                    console.error("Upload error:", error);
                    alert("Upload failed: " + error.message);
                },
                async () => {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    await db.collection("files").add({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: downloadURL,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    fileInput.value = '';
                    progressBar.style.width = '0%';
                    progressText.textContent = '0%';
                    loadFiles();
                }
            );
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + error.message);
        }
    }

    // Load files from Firestore
    async function loadFiles() {
        try {
            const snapshot = await db.collection("files")
                .orderBy("timestamp", "desc")
                .get();
            
            fileList.innerHTML = '<div class="file-list-header"><span>File Name</span><span>Size</span><span>Action</span></div>';
            
            snapshot.forEach(doc => {
                const file = doc.data();
                displayFile(file);
            });
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }

    function displayFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <span class="file-date">${file.timestamp?.toDate().toLocaleDateString()}</span>
            <span>${formatFileSize(file.size)}</span>
            <div class="file-actions">
                <a href="${file.url}" download="${file.name}" class="download-btn">
                    <i class="fas fa-download"></i>
                </a>
                <span class="file-time">${file.timestamp?.toDate().toLocaleTimeString()}</span>
            </div>
        `;
        fileList.appendChild(fileItem);
    }

    // Initial load
    loadFiles();
}
// Initialize Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            // Here you would typically send the data to a server
            console.log('Contact form submitted:', { name, email, message });
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    initFileUpload();
    initContactForm();
});