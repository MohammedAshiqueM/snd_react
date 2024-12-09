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
  