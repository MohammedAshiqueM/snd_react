import axios from './axios';

//user signup
export const signupUser = async (userData) => {
    try {
        const response = await axios.post(`register/`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//user login
export const loginUser = async (userData) => {
    try {
        const response = await axios.post(``, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//email verification
export const emailVerification = async (userData) => {
    try{
        const response = await axios.post(`otp/`,userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//resend otp
export const resentOtp = async (userData) => {
    try{
        const response = await axios.post(`resent-otp/`,userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}