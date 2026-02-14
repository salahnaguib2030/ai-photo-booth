// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const outputCanvas = document.getElementById('outputCanvas');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const approveBtn = document.getElementById('approveBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const newPhotoBtn = document.getElementById('newPhotoBtn');
const styleSelector = document.getElementById('styleSelector');
const approveControls = document.querySelector('.approve-controls');
const resultControls = document.querySelector('.result-controls');

let stream = null;
let capturedImageData = null;
let isProcessing = false;
let selectedStyle = 'realistic'; // Default style
let inactivityTimer = null;
const INACTIVITY_TIMEOUT = 120000; // 2 minutes

// Inactivity detection - redirect to welcome after 2 minutes
function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log('⏱️ Inactivity timeout - returning to welcome page');
        window.location.href = 'index.html';
    }, INACTIVITY_TIMEOUT);
}

// Track user activity
const activityEvents = ['click', 'touchstart', 'mousemove', 'keypress'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Check if page was refreshed (not first visit)
if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    console.log('🔄 Page refreshed - redirecting to welcome page');
    window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌙 Ramadan Photo Booth Camera - using n8n webhook');
    console.log('Webhook URL:', CONFIG.N8N_WEBHOOK_URL);
    
    // Start inactivity timer
    resetInactivityTimer();
    
    // Style selector option clicks
    const styleOptions = document.querySelectorAll('.style-option');
    styleOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedStyle = option.getAttribute('data-style');
            console.log('Selected style:', selectedStyle);
            
            // Hide style selector, show approve controls
            styleSelector.style.display = 'none';
            approveControls.style.display = 'flex';
            
            showNotification(`${selectedStyle.toUpperCase()} style selected!`, 'success');
        });
    });
    
    // Auto-start camera on page load
    setTimeout(async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 960 },
                    facingMode: 'user'
                } 
            });
            
            video.srcObject = stream;
            
            // Wait for video to be ready
            video.onloadedmetadata = () => {
                video.play();
                video.classList.add('show');
            };
            
            startCameraBtn.style.display = 'none';
            captureBtn.style.display = 'flex';
            showNotification('Camera activated!', 'success');
        } catch (error) {
            console.error('Error accessing camera:', error);
            showNotification('Unable to access camera. Please grant permissions.', 'warning');
            // Show manual start button if auto-start fails
            startCameraBtn.style.display = 'flex';
        }
    }, 100);
});

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : 'rgba(37, 99, 235, 0.95)'};
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.6);
        border: 2px solid ${type === 'success' ? '#6ee7b7' : type === 'warning' ? '#fbbf24' : 'rgba(147, 197, 253, 0.8)'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Start Camera
startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 960 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            video.play();
            video.classList.add('show');
        };
        
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'flex';
        showNotification('Camera activated!', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        showNotification('Unable to access camera. Please grant permissions.', 'warning');
    }
});

// Capture Photo
captureBtn.addEventListener('click', () => {
    // Capture from the video element
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    canvas.toBlob(async (blob) => {
        capturedImageData = blob;
        
        // Hide video, show captured photo on outputCanvas
        video.classList.remove('show');
        outputCanvas.classList.add('show');
        
        // Display captured photo on outputCanvas
        const img = new Image();
        img.onload = () => {
            outputCanvas.width = canvas.width;
            outputCanvas.height = canvas.height;
            const ctx = outputCanvas.getContext('2d');
            ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
            ctx.drawImage(img, 0, 0, outputCanvas.width, outputCanvas.height);
        };
        img.src = URL.createObjectURL(blob);
        
        // Hide capture button, show style selector
        captureBtn.style.display = 'none';
        styleSelector.style.display = 'flex';
        
        showNotification('Photo captured! Choose your style', 'success');
    }, 'image/jpeg', 0.95);
});

// Retake Photo
retakeBtn.addEventListener('click', () => {
    // Reset buttons and UI
    approveControls.style.display = 'none';
    styleSelector.style.display = 'none';
    captureBtn.style.display = 'flex';
    resultControls.style.display = 'none';
    
    // Clear captured data
    capturedImageData = null;
    
    // Show video again, hide outputCanvas
    video.classList.add('show');
    outputCanvas.classList.remove('show');
    
    showNotification('Ready for a new photo!', 'info');
});

// Approve Photo - Send to n8n
approveBtn.addEventListener('click', async () => {
    if (!capturedImageData) {
        showNotification('No photo to process', 'warning');
        return;
    }
    
    // Hide approve controls
    approveControls.style.display = 'none';
    
    // Process image with n8n
    await processImageWithRamadanBackground(capturedImageData);
});

// New Photo Button
newPhotoBtn.addEventListener('click', () => {
    // Redirect to welcome page for new photo
    window.location.href = 'index.html';
});

// Print Button
printBtn.addEventListener('click', () => {
    if (!capturedImageData) {
        showNotification('No photo to print', 'warning');
        return;
    }
    
    // Create a print window with the enhanced image
    const img = new Image();
    img.onload = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Print Photo</title>');
        printWindow.document.write('<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}img{max-width:100%;height:auto;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<img src="' + outputCanvas.toDataURL('image/jpeg', 0.95) + '" />');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // Wait for image to load then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            
            // After printing, redirect to welcome page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }, 250);
    };
    img.src = outputCanvas.toDataURL('image/jpeg', 0.95);
    
    showNotification('Opening print dialog...', 'info');
});

// Download Button
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = outputCanvas.toDataURL('image/jpeg', 0.95);
    link.download = `ramadan-photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Photo downloaded!', 'success');
});

// Process image with n8n webhook (via backend proxy)
async function processImageWithRamadanBackground(imageBlob) {
    try {
        // Show loading spinner
        loadingSpinner.style.display = 'block';
        isProcessing = true;
        
        console.log('📸 Processing image via backend API...');
        console.log('Image size:', (imageBlob.size / 1024).toFixed(2), 'KB');
        console.log('Selected style:', selectedStyle);
        console.log('API endpoint:', CONFIG.API_ENDPOINT);
        
        // Convert blob to base64
        const reader = new FileReader();
        const base64Image = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });
        
        console.log('Image converted to base64, sending to backend...');
        
        // Send to backend API as JSON
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image,
                style: selectedStyle  // 'realistic' or 'disney'
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Backend API error: ${response.status} - ${errorData.error || errorData.message}`);
        }
        
        // Parse JSON response
        const result = await response.json();
        console.log('✅ Backend response received');
        
        let editedImageUrl;
        
        // Handle response from backend
        if (result.success) {
            if (result.imageBase64) {
                // Backend returned base64 image
                console.log('Processing base64 image from backend');
                const base64Data = result.imageBase64;
                const contentType = result.contentType || 'image/png';
                editedImageUrl = `data:${contentType};base64,${base64Data}`;
            } else if (result.data) {
                // Backend returned n8n's JSON response
                const data = result.data;
                
                // Check for various possible response formats
                const possibleBase64Fields = ['editedImageBase64', 'imageBase64', 'base64', 'data', 'image'];
                const possibleUrlFields = ['editedImageUrl', 'imageUrl', 'url', 'output', 'result'];
                
                // Try base64 fields first
                for (const field of possibleBase64Fields) {
                    if (data[field] && typeof data[field] === 'string' && data[field].length > 100) {
                        console.log(`Found base64 image in field: ${field}`);
                        editedImageUrl = `data:image/png;base64,${data[field]}`;
                        break;
                    }
                }
                
                // Try URL fields if no base64 found
                if (!editedImageUrl) {
                    for (const field of possibleUrlFields) {
                        if (data[field] && typeof data[field] === 'string' && data[field].startsWith('http')) {
                            console.log(`Found image URL in field: ${field}`);
                            editedImageUrl = data[field];
                            break;
                        }
                    }
                }
                
                if (!editedImageUrl) {
                    throw new Error(`No image found in backend response`);
                }
            }
        } else {
            throw new Error('Backend returned unsuccessful response');
        }
        
        // Display edited photo on outputCanvas
        const img = new Image();
        img.onload = () => {
            const ctx = outputCanvas.getContext('2d');
            // Set canvas size to match image
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;
            ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Make sure outputCanvas is visible
            outputCanvas.classList.add('show');
            
            // Show result controls
            resultControls.style.display = 'flex';
        };
        img.src = editedImageUrl;
        
        // Show success notification
        showNotification(`✨ Ramadan masterpiece created with ${selectedStyle} style!`, 'success');
        
    } catch (error) {
        console.error('❌ Error processing image:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = error.message;
        
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - Check backend API connection';
        } else if (error.message.includes('Backend API error')) {
            errorMessage = 'Backend processing error - Check n8n workflow';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Processing timeout - Please try again';
        }
        
        showNotification('Image processing failed - Please try again', 'warning');
        
        // Show retake button again
        approveControls.style.display = 'flex';
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
        isProcessing = false;
    }
}

// Stop camera when page is closed
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
