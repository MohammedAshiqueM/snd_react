import instance from './axios';
import useAuthStore from './store/useAuthStore';

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
        const { user } = response.data;

        console.log("the user is ",user)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user);
        
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
        const { user } = response.data;

        console.log("the user is ",user)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user);
        
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
        const { user } = response.data;

        console.log("the user is ",user)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user);
        return response.data;
    } catch (error) {
        console.error('Error during googleSignin:', error); 
        throw error.response ? error.response.data : error.message;
    }
};

//refresh token
export const refreshToken = async () => {
    try {
        const response = await instance.post('/token/refresh/');
        console.log('New access token received via cookies',response);
        const { user } = response.data;

        console.log("the user is ",user)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user);
        return response.data.access; // No need to manually set tokens.(I am using HTTPonly)
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
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        return response;
    } catch (error) {
        console.error("Authentication Error:", error);
        console.error("Error Response:", error.response);
        throw error.response ? error.response.data : error.message;
    }
};

//Logout user
export const logoutUser = async () => {
    try {
        await instance.post('logout/'); 
        
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

//Suggest tags
export const tagSuggestion = async (query) => {
    try {
        const response = await instance.get(`tags?search=${query}`); 
        
        return response
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

//View my profile
export const myProfile = async () => {
    try {
        const response = await instance.get('profile/'); 
       
        return response
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

//Update my profile
export const updateProfile = async (userData) => {
    try {
        const response = await instance.put('profile/update/', userData,{
            headers: {
                'Content-Type': 'multipart/form-data'
              }
        }); 
        return response
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

//Create blog
export const createBlog = async (userData) => {
    try {
      const response = await instance.post('blog/create/', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error during blog creation:', error);
  
      throw error.response || error; 
    }
  };

//Get user blogs
export const getBlogs = async (data) => {
    try {
        console.log("Fetching Blogs with Params:", data);

        const params = new URLSearchParams(data).toString();

        const response = await instance.get(`blogs/?${params}`);
        return response.data;
    } catch (error) {
        console.error("Error during fetching the blogs", error);
    }
};

//Get user skills
export const userSkills = async (data) => {
    try{
        const response = await instance.get('skills/')
        return response
    } catch (error) {
        console.error("Error during get the blogs")
    }
}
  
//Get blog by slug
export const blogRead = async (slug) => {
    try{
        const response = await instance.get(`blog/${slug}/`)
        return response.data
    } catch (error) {
        console.error("Error during get the blogs")
        throw error
    }
}

//post comment
export const postComment = async (slug, content) => {
    try{
        const response = await instance.post(`blog/${slug}/add-comment/`, {content})
        return response.data
    } catch (error) {
        console.error("Error during posting comment")
        throw error
    }
}

//post comment
export const getComments = async (slug) => {
    try{
        const response = await instance.get(`blog/${slug}/comments/`)
        return response.data
    } catch (error) {
        console.error("Error during posting comment")
        throw error
    }
}