export const saveToSession = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
};

export const getFromSession = (key) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};