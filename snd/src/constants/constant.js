export const baseUrl = 'http://127.0.0.1:8000/'

export const getCloudinaryUrl = (path) => {
    if (!path) return null;
    // Check if it's already a full Cloudinary URL
    if (path.startsWith('http')) return path;
    // Construct Cloudinary URL
    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUD_NAME}/${path}`;
  };
