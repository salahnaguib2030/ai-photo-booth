// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌙 Ramadan Photo Booth - Welcome Screen');
    
    // Welcome screen tap to navigate to camera page
    if (welcomeScreen) {
        welcomeScreen.addEventListener('click', () => {
            window.location.href = 'camera.html';
        });
    }
});
