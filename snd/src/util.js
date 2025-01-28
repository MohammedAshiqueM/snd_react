export const saveToSession = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSession = (key) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

export function truncateText(text, maxWords) {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  }
  
export const clearAllCookies = () => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const handleFileChange = (e, type) => {
    const file = e.target.files[0];

    if (file) {
        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            alert("File size exceeds 5MB. Please upload a smaller file.");
            return;
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
            return;
        }

        // Update the form state
        setFormData(prev => ({
            ...prev,
            [type]: file,
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "profile_image") {
                setProfileImagePreview(reader.result);
            } else {
                setBannerImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
};

export const isValidURL = (url, type) => {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/.*$/;
    const githubRegex = /^https:\/\/(www\.)?github\.com\/.*$/;

    if (type === "linkedin" && url && !linkedinRegex.test(url)) {
        return "Invalid LinkedIn URL. Example: https://www.linkedin.com/in/username";
    }

    if (type === "github" && url && !githubRegex.test(url)) {
        return "Invalid GitHub URL. Example: https://github.com/username";
    }

    return null;
};

export const validateImage = (file) => {
    if (!file) return null;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size must be less than 5MB.(frontend)';
    }
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and JPG formats are allowed.(from front end)';
    }
    return null;
  };

  export const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };