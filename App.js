// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Display username
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('welcomeUser').textContent = `Selamat datang, ${username}`;
    
    initializeApp();
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
});

// File storage (using localStorage)
let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

function initializeApp() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const searchInput = document.getElementById('searchInput');
    
    // Click to select files
    selectFileBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.classList.contains('upload-text') || 
            e.target.classList.contains('upload-subtext')) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Search functionality
    searchInput.addEventListener('input', filterFiles);
    
    // Display existing files
    displayFiles();
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
}

function handleFileSelect(e) {
    const selectedFiles = e.target.files;
    processFiles(selectedFiles);
}

function processFiles(fileList) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = [];
    
    for (let file of fileList) {
        if (file.size > maxSize) {
            alert(`File ${file.name} terlalu besar. Maksimal 10MB.`);
            continue;
        }
        validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
        uploadFiles(validFiles);
    }
}

function uploadFiles(fileList) {
    const progressDiv = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressDiv.style.display = 'block';
    let progress = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Uploading... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Add files to storage
            for (let file of fileList) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        data: e.target.result,
                        uploadDate: new Date().toISOString()
                    };
                    
                    files.push(fileData);
                    saveFiles();
                    displayFiles();
                };
                reader.readAsDataURL(file);
            }
            
            setTimeout(() => {
                progressDiv.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = 'Uploading...';
                document.getElementById('fileInput').value = '';
            }, 500);
        }
    }, 200);
}

function saveFiles() {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
}

function displayFiles(filesToShow = files) {
    const filesGrid = document.getElementById('filesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filesToShow.length === 0) {
        filesGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    filesGrid.innerHTML = '';
    
    filesToShow.forEach(file => {
        const fileCard = createFileCard(file);
        filesGrid.appendChild(fileCard);
    });
}

function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);
    const uploadDate = formatDate(file.uploadDate);
    
    card.innerHTML = `
        <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            ${fileIcon}
        </svg>
        <div class="file-name">${file.name}</div>
        <div class="file-info">
            <span class="file-size">${fileSize}</span>
            <span class="file-date">${uploadDate}</span>
        </div>
        <div class="file-actions">
            <button class="btn btn-primary" onclick="downloadFile('${file.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </button>
            <button class="btn btn-danger" onclick="confirmDelete('${file.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Hapus
            </button>
        </div>
    `;
    
    return card;
}

function getFileIcon(type) {
    if (type.startsWith('image/')) {
        return '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>';
    } else if (type.startsWith('video/')) {
        return '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>';
    } else if (type.startsWith('audio/')) {
        return '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
    } else if (type.includes('pdf')) {
        return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>';
    } else {
        return '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Baru saja';
    }
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} menit lalu`;
    }
    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} jam lalu`;
    }
    // More than 1 day
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function downloadFile(fileId) {
    const file = files.find(f => f.id == fileId);
    if (!file) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

let fileToDelete = null;

function confirmDelete(fileId) {
    fileToDelete = fileId;
    document.getElementById('deleteModal').style.display = 'flex';
}

document.getElementById('confirmDelete').addEventListener('click', function() {
    if (fileToDelete) {
        files = files.filter(f => f.id != fileToDelete);
        saveFiles();
        displayFiles();
        fileToDelete = null;
    }
    document.getElementById('deleteModal').style.display = 'none';
});

document.getElementById('cancelDelete').addEventListener('click', function() {
    fileToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
});

// Close modal when clicking outside
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) {
        fileToDelete = null;
        this.style.display = 'none';
    }
});

function filterFiles() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm)
    );
    displayFiles(filteredFiles);
}
