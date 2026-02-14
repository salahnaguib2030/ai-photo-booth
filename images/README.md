# Background Image

## Upload Your Background Image Here

Place your background image in this folder and name it **`background.jpg`**

### Requirements:
- **File name**: `background.jpg` (or update the path in `camera.css`)
- **Recommended size**: 1920x1080px or larger
- **Format**: JPG, PNG, or any web-compatible image format
- **Theme**: Ramadan/Islamic themed backgrounds work best

### Alternative File Names:
If you want to use a different file name, update the CSS in `camera.css`:

```css
.camera-background {
    background-image: url('./images/your-image-name.jpg');
}
```

### Opacity Control:
The background opacity is set to 0.3 (30%) in `camera.css`. Adjust as needed:

```css
.camera-background {
    opacity: 0.3;  /* Change this value (0.0 to 1.0) */
}
```

### Current Setup:
- Background appears behind the camera feed
- Camera feed is centered with 100px margins on left/right
- Camera height is reduced by 70px (35px top/bottom margins)
- Background covers full screen area

### Tips:
- Use high-quality images for best results
- Darker backgrounds work better behind the camera
- Consider Ramadan themes: mosques, crescents, lanterns, Islamic patterns
- The background will be visible in the 100px margins around the camera
