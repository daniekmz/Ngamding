/* Add this to your existing styles.css */
.file-upload-container {
    margin-top: 30px;
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upload-box {
    border: 2px dashed var(--accent-color);
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.upload-box:hover {
    background: var(--hover-bg);
}

#file-upload {
    display: none;
}

#upload-button {
    background: var(--accent-color);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-block;
    font-size: 1rem;
    border: none;
}

#upload-button:hover {
    background: var(--primary-btn);
    transform: translateY(-2px);
}

.upload-progress {
    margin-top: 1rem;
    height: 6px;
    background: var(--card-bg);
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: var(--accent-color);
    width: 0%;
    transition: width 0.3s ease;
}

.file-list {
    margin-top: 1.5rem;
    background: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
}

.file-list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    padding: 1rem;
    background: var(--hover-bg);
    font-weight: bold;
}

.file-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--hover-bg);
    transition: background 0.2s ease;
}

.file-item:hover {
    background: var(--hover-bg);
}

.download-btn {
    color: var(--accent-color);
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
}

.download-btn:hover {
    color: var(--primary-btn);
    transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .file-list-header,
    .file-item {
        grid-template-columns: 2fr 1fr;
    }
    
    .file-list-header span:nth-child(3),
    .file-list-header span:nth-child(4),
    .file-item span:nth-child(3),
    .file-item span:nth-child(4) {
        display: none;
    }
}
