export const baseUrl = 'https://api.granddepart.shop/'

export const getCloudinaryUrl = (path) => {
    if (!path) return null;
    // Check(full Cloudinary URL)
    if (path.startsWith('http')) return path;
    // Construct Cloudinary URL
    return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUD_NAME}/${path}`;
  };
