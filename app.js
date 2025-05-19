// Initialize Chat with Supabase
function initChat() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatForm || !chatMessages) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('chat-name').value.trim();
        const message = document.getElementById('chat-message').value.trim();
        
        if (name && message) {
            try {
                const { error } = await supabase
                    .from('messages')
                    .insert([
                        { 
                            name: name, 
                            message: message,
                            created_at: new Date()
                        }
                    ]);
                
                if (error) throw error;
                
                document.getElementById('chat-message').value = '';
                document.getElementById('chat-message').focus();
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again.");
            }
        }
    });

    // Load messages with real-time updates
    const subscription = supabase
        .from('messages')
        .on('*', payload => {
            loadMessages();
        })
        .subscribe();

    // Initial load
    loadMessages();
}

async function loadMessages() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        chatMessages.innerHTML = '';
        messages.forEach(message => {
            displayMessage(message);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error("Error loading messages:", error);
    }
}

function displayMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${message.name}</strong>
            <small>${new Date(message.created_at).toLocaleString()}</small>
        </div>
        <p>${message.message}</p>
    `;
    chatMessages.appendChild(messageElement);
}

// Enhanced File Upload Functionality with Supabase
function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const dropZone = document.getElementById('drop-zone');
    const browseLink = document.querySelector('.browse-link');
    const fileList = document.getElementById('file-list');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const uploadIcon = document.querySelector('.upload-icon');
    const uploadText = document.querySelector('.upload-text');
    
    if (!fileInput || !dropZone) {
        console.error('Upload elements not found');
        return;
    }

    // Handle click on drop zone or browse link
    dropZone.addEventListener('click', (e) => {
        // Prevent triggering when clicking on browse link
        if (e.target !== browseLink) {
            fileInput.click();
        }
    });

    // Handle click on browse link specifically
    browseLink.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the dropZone click
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
        uploadIcon.classList.add('dragover');
        uploadText.textContent = 'Drop file to upload';
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
        uploadIcon.classList.remove('dragover');
        uploadText.textContent = 'Drag & drop files or browse';
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleFileUpload(file);
        }
    }

    async function handleFileUpload(file) {
        try {
            uploadText.textContent = 'Uploading...';
            uploadIcon.classList.add('uploading');
            
            const filePath = `uploads/${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progressEvent) => {
                        const progress = (progressEvent.loaded / progressEvent.total) * 100;
                        progressBar.style.width = `${progress}%`;
                        progressText.textContent = `${Math.round(progress)}%`;
                    }
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // Save file metadata to Supabase
            const { data: fileData, error: dbError } = await supabase
                .from('files')
                .insert([
                    { 
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: publicUrl,
                        path: filePath,
                        created_at: new Date()
                    }
                ]);

            if (dbError) throw dbError;

            // Reset input and progress
            fileInput.value = '';
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            uploadText.textContent = 'Upload complete!';
            uploadIcon.classList.remove('uploading');
            uploadIcon.classList.add('success');
            
            setTimeout(() => {
                uploadText.textContent = 'Drag & drop files or browse';
                uploadIcon.classList.remove('success');
            }, 2000);
            
            // Refresh file list
            loadFiles();
        } catch (error) {
            console.error("Upload failed:", error);
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            uploadText.textContent = 'Upload failed. Try again.';
            uploadIcon.classList.remove('uploading');
            uploadIcon.classList.add('error');
            
            setTimeout(() => {
                uploadText.textContent = 'Drag & drop files or browse';
                uploadIcon.classList.remove('error');
            }, 2000);
        }
    }

    // Load files from Supabase
    async function loadFiles() {
        try {
            const { data: files, error } = await supabase
                .from('files')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            fileList.innerHTML = '<div class="file-list-header"><span>File Name</span><span>Date</span><span>Size</span><span>Action</span></div>';
            
            if (files.length === 0) {
                fileList.innerHTML += '<div class="no-files">No files uploaded yet</div>';
            } else {
                files.forEach(file => {
                    displayFile(file);
                });
            }
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }

    function displayFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-date">${new Date(file.created_at).toLocaleDateString()}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <div class="file-actions">
                <a href="${file.url}" download="${file.name}" class="download-btn">
                    <i class="fas fa-download"></i> Download
                </a>
                <button class="delete-btn" data-id="${file.id}" data-path="${file.path}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        fileList.appendChild(fileItem);
        
        // Add delete event listener
        const deleteBtn = fileItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to delete this file?')) {
                try {
                    // Delete from storage
                    const { error: storageError } = await supabase.storage
                        .from('files')
                        .remove([file.path]);
                    
                    if (storageError) throw storageError;
                    
                    // Delete from database
                    const { error: dbError } = await supabase
                        .from('files')
                        .delete()
                        .eq('id', file.id);
                    
                    if (dbError) throw dbError;
                    
                    // Remove from UI
                    fileItem.remove();
                    
                    // Show success message
                    alert('File deleted successfully');
                } catch (error) {
                    console.error("Error deleting file:", error);
                    alert("Failed to delete file. Please try again.");
                }
            }
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1048576).toFixed(2)} MB`;
    }

    // Initial load
    loadFiles();
}

// Initialize Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            
            if (name && email && message) {
                try {
                    const { error } = await supabase
                        .from('contacts')
                        .insert([
                            { 
                                name: name, 
                                email: email,
                                message: message,
                                created_at: new Date()
                            }
                        ]);
                    
                    if (error) throw error;
                    
                    alert('Thank you for your message! I will get back to you soon.');
                    contactForm.reset();
                } catch (error) {
                    console.error("Error submitting contact form:", error);
                    alert("Failed to send message. Please try again.");
                }
            }
        });
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    initFileUpload();
    initContactForm();
});