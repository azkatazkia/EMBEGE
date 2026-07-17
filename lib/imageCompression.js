function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataURL;
    });
}

function getScaledDimensions(img, maxSize) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (width > maxSize || height > maxSize) {
        const longestSide = Math.max(width, height);
        const scale = maxSize / longestSide;
        const newWidth = width * scale;
        const newHeight = height * scale;
        return { width: newWidth, height: newHeight };
    }
    return { width, height };
}

function compressToDataURL(img, maxSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const dimension = getScaledDimensions(img, maxSize);
    canvas.width = dimension.width;
    canvas.height = dimension.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    return dataURL;
}

export default async function compressImage(file) {
    const dataURL = await readFileAsDataURL(file);
    const img = await loadImage(dataURL);
    const compressedDataURL = compressToDataURL(img, 1568);
    const finalURL = compressedDataURL.split(',')[1];
    return { base64: finalURL, mediaType: 'image/jpeg'};
}
