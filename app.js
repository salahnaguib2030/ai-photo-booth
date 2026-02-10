// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const originalPreview = document.getElementById('originalPreview');
const editedPreview = document.getElementById('editedPreview');
const loadingSpinner = document.getElementById('loadingSpinner');
const downloadBtn = document.getElementById('downloadBtn');
const downloadSection = document.querySelector('.download-section');
const styleSelector = document.getElementById('styleSelector');

let stream = null;
let capturedImageData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎨 AI Photo Booth ready - using n8n webhook');
    console.log('Webhook URL:', CONFIG.N8N_WEBHOOK_URL);
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
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
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
        startCameraBtn.disabled = true;
        captureBtn.disabled = false;
        startCameraBtn.textContent = '📷 Camera Active';
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
});

// Capture Photo
captureBtn.addEventListener('click', () => {
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    canvas.toBlob(async (blob) => {
        capturedImageData = blob;
        
        // Display original photo
        const imgUrl = URL.createObjectURL(blob);
        displayImage(originalPreview, imgUrl);
        
        // Show retake button
        retakeBtn.style.display = 'inline-flex';
        captureBtn.disabled = true;
        
        // Process image with Ramadan background
        await processImageWithRamadanBackground(blob);
    }, 'image/jpeg', 0.95);
});

// Retake Photo
retakeBtn.addEventListener('click', () => {
    // Clear previews
    originalPreview.innerHTML = '<span class="placeholder-text">Your photo will appear here</span>';
    editedPreview.innerHTML = '<span class="placeholder-text">AI edited photo will appear here</span>';
    
    // Reset buttons
    retakeBtn.style.display = 'none';
    captureBtn.disabled = false;
    downloadSection.style.display = 'none';
    
    // Clear captured data
    capturedImageData = null;
});

// Display Image
function displayImage(container, imageUrl) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Photo';
    container.appendChild(img);
}

// Process Image with n8n Webhook
async function processImageWithRamadanBackground(imageBlob) {
    try {
        // Show loading spinner
        loadingSpinner.style.display = 'block';
        editedPreview.querySelector('.placeholder-text')?.remove();
        
        // Get selected style from dropdown
        const selectedStyle = styleSelector ? styleSelector.value : 'realistic';
        
        console.log('📸 Processing image with n8n webhook...');
        console.log('Image size:', (imageBlob.size / 1024).toFixed(2), 'KB');
        console.log('Selected style:', selectedStyle);
        console.log('Webhook URL:', CONFIG.N8N_WEBHOOK_URL);
        
        // Create FormData to send image as file
        const formData = new FormData();
        formData.append('image', imageBlob, 'photo.jpg');
        formData.append('style', selectedStyle);  // 'realistic' or 'disney'
        
        // Send to n8n webhook as multipart/form-data
        const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData  // Browser sets Content-Type automatically with boundary
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
        }
        
        // Check content-type to determine how to handle response
        const contentType = response.headers.get('content-type') || '';
        console.log('Content-Type:', contentType);
        
        let editedImageUrl;
        
        // If response is binary image (PNG, JPEG, etc.)
        if (contentType.includes('image/')) {
            console.log('✅ Received binary image response');
            const blob = await response.blob();
            editedImageUrl = URL.createObjectURL(blob);
            console.log('Created object URL for image:', editedImageUrl);
        } else {
            // Handle JSON response
            const responseText = await response.text();
            console.log('Response text length:', responseText.length);
            
            if (!responseText || responseText.trim() === '') {
                throw new Error('n8n webhook returned empty response');
            }
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                // Maybe it's binary that wasn't marked correctly
                console.log('Not JSON, might be binary image');
                const blob = new Blob([responseText], { type: 'image/png' });
                editedImageUrl = URL.createObjectURL(blob);
            }
            
            if (result && !editedImageUrl) {
                console.log('✅ n8n JSON response:', JSON.stringify(result, null, 2));
                
                // Check for various possible response formats from n8n
                const possibleBase64Fields = ['editedImageBase64', 'imageBase64', 'base64', 'data', 'image'];
                const possibleUrlFields = ['editedImageUrl', 'imageUrl', 'url', 'output', 'result'];
                
                // Try base64 fields first
                for (const field of possibleBase64Fields) {
                    if (result[field] && typeof result[field] === 'string' && result[field].length > 100) {
                        console.log(`Found base64 image in field: ${field}`);
                        editedImageUrl = `data:image/png;base64,${result[field]}`;
                        break;
                    }
                }
                
                // Try URL fields if no base64 found
                if (!editedImageUrl) {
                    for (const field of possibleUrlFields) {
                        if (result[field] && typeof result[field] === 'string' && result[field].startsWith('http')) {
                            console.log(`Found image URL in field: ${field}`);
                            editedImageUrl = result[field];
                            break;
                        }
                    }
                }
                
                // Check if response is an array
                if (!editedImageUrl && Array.isArray(result) && result.length > 0) {
                    const firstItem = result[0];
                    for (const field of [...possibleBase64Fields, ...possibleUrlFields]) {
                        if (firstItem[field]) {
                            if (firstItem[field].startsWith('http')) {
                                editedImageUrl = firstItem[field];
                            } else if (firstItem[field].length > 100) {
                                editedImageUrl = `data:image/png;base64,${firstItem[field]}`;
                            }
                            break;
                        }
                    }
                }
                
                if (!editedImageUrl) {
                    throw new Error(`No image found in response: ${JSON.stringify(result).substring(0, 200)}`);
                }
            }
        }
        
        // Display edited photo
        displayImage(editedPreview, editedImageUrl);
        
        // Show download button
        downloadSection.style.display = 'block';
        downloadBtn.onclick = () => downloadImage(editedImageUrl);
        
        // Show success notification
        showNotification(`Image processed with ${selectedStyle} style!`, 'success');
        
    } catch (error) {
        console.error('❌ Error processing image:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = error.message;
        
        // Provide helpful error messages
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - Check n8n webhook connection';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Processing timeout - Try again';
        }
        
        editedPreview.innerHTML = `
            <span class="placeholder-text" style="color: #ef4444;">
                ❌ Error processing image<br>
                <small style="display: block; margin-top: 10px;">${errorMessage}</small>
                <small style="display: block; margin-top: 5px; opacity: 0.8;">Check browser console (F12) for details</small>
            </span>
        `;
        
        showNotification('Image processing failed', 'warning');
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Download Image
function downloadImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-edited-photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Stop camera when page is closed
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
