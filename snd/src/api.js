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
        const response = await axios.post(`token/`, userData);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        console.log(response.data)
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//email verification
export const emailVerification = async (userData) => {
    try{
        const response = await axios.post(`otp/`,userData);
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
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

//sign in with google
export const googleSignin = async (token) => {
    try {
        console.log("Sending token to backend:", token); 
        const response = await axios.post(`auth/google-login/`, { token });
        console.log("Backend response:", response.data);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        return response.data;
    } catch (error) {
        console.error('Error during googleSignin:', error);  // Log any errors
        throw error.response ? error.response.data : error.message;
    }
};
