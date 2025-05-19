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
        if (e.target !== browseLink) {
            fileInput.click();
        }
    });

    browseLink.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
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
            // Validate file size (e.g., 10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit');
            }

            uploadText.textContent = 'Uploading...';
            uploadIcon.classList.add('uploading');
            progressBar.style.width = '0%';
            progressText.textContent = '0%';

            const filePath = `uploads/${Date.now()}_${file.name}`;
            
            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            // Save file metadata to database
            const { data: fileData, error: dbError } = await supabase
                .from('files')
                .insert([{
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: publicUrl,
                    path: filePath,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (dbError) throw dbError;

            // Reset and show success
            fileInput.value = '';
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            uploadText.textContent = 'Upload complete!';
            uploadIcon.classList.remove('uploading');
            uploadIcon.classList.add('success');
            
            setTimeout(() => {
                uploadText.textContent = 'Drag & drop files or browse';
                uploadIcon.classList.remove('success');
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
            }, 2000);
            
            // Refresh file list
            loadFiles();
        } catch (error) {
            console.error("Upload failed:", error);
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            uploadText.textContent = error.message || 'Upload failed. Try again.';
            uploadIcon.classList.remove('uploading');
            uploadIcon.classList.add('error');
            
            setTimeout(() => {
                uploadText.textContent = 'Drag & drop files or browse';
                uploadIcon.classList.remove('error');
            }, 3000);
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
            
            if (!files || files.length === 0) {
                fileList.innerHTML += '<div class="no-files">No files uploaded yet</div>';
            } else {
                files.forEach(file => {
                    displayFile(file);
                });
            }
        } catch (error) {
            console.error("Error loading files:", error);
            fileList.innerHTML = '<div class="no-files">Error loading files</div>';
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
                    
                    fileItem.remove();
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

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
});