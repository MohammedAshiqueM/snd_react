import instance from './axios';

//user signup
export const signupUser = async (userData) => {
    try {
        const response = await instance.post(`register/`, userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//user login
export const loginUser = async (userData) => {
    try {
        const response = await instance.post(`token/`, userData);
        // localStorage.setItem('access_token', response.data.access_token);
        // localStorage.setItem('refresh_token', response.data.refresh_token);
        console.log("login rep",response)
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//email verification
export const emailVerification = async (userData) => {
    try{
        const response = await instance.post(`otp/`,userData);
        // localStorage.setItem('access_token', response.data.access_token);
        // localStorage.setItem('refresh_token', response.data.refresh_token);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//resend otp
export const resentOtp = async (userData) => {
    try{
        const response = await instance.post(`resent-otp/`,userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

//sign in with google
export const googleSignin = async () => {
    try {
        // console.log("Sending token to backend:", token); 
        const response = await instance.post(`auth/google-login/`,null, {withCredentials:true});
        console.log("Backend response:", response.data);
        // localStorage.setItem('access_token', response.data.access);
        // localStorage.setItem('refresh_token', response.data.refresh);
        return response.data;
    } catch (error) {
        console.error('Error during googleSignin:', error);  // Log any errors
        throw error.response ? error.response.data : error.message;
    }
};

//refresh token
export const refreshToken = async () => {
    try {
        const response = await instance.post('/token/refresh/');
        console.log('New access token received via cookies',response);
        return response.data.access; // No need to manually set tokens.
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};
  
  
//forgot Password
export const forgetPassword = async (email) => {
    try {
        console.log("Sending mail to backend:", email); 
        const response = await instance.post(`forget-password/`, { email });
        console.log("Backend response:", response.data);
        return response;
    } catch (error) {
        console.error(error);
        throw error.response ? error.response.data : error.message;
    }
};

//reset Password
export const resetPassword = async (data) => {
    try {
        console.log("Sending data to backend:", data); 
        const response = await instance.post(`reset-password/`, data );
        console.log("Backend response:", response.data);
        return response;
    } catch (error) {
        console.error(error);
        throw error.response ? error.response.data : error.message;
    }
};

//user authentication
export const auth = async () => {
    try {
        console.log("Attempting authentication...");
        
        const response = await instance.get(`auth/check/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true
        });
        
        console.log("Backend response on http only:", response);
        console.log("Response Headers:", response.headers);
        console.log("Cookies:", document.cookie);
        
        return response;
    } catch (error) {
        console.error("Authentication Error:", error);
        console.error("Error Response:", error.response);
        throw error.response ? error.response.data : error.message;
    }
};

export const logoutUser = async () => {
    try {
        await instance.post('logout/'); // Adjust the endpoint if needed
        // Optionally clear local state if necessary
    } catch (error) {
        console.error("Error during logout:", error);
    }
};
