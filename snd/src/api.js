import instance from './axios';
// import useAdminStore from './store/useAdminStore';
import useAuthStore from './store/useAuthStore';
import { clearAllCookies } from './util';
import  Cookies  from 'js-cookie';

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
        const { user,role } = response.data;

        console.log("the user is ",user)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user,role);
        
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
export const googleSignin = async (idToken) => {
    try {
        // Remove any existing tokens
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');

        // Send Google ID token to backend
        const response = await instance.post(`auth/google-login/`, 
            { id_token: idToken }, 
            { withCredentials: true }
        );

        const { user, access_token, refresh_token } = response.data;

        // Set tokens as cookies
        Cookies.set('access_token', access_token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });
        
        Cookies.set('refresh_token', refresh_token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });

        // Update auth store
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(true);
        setUser(user);

        return response.data;
    } catch (error) {
        console.error('Error during googleSignin:', error);
        
        // Handle specific authentication errors
        if (error.response && error.response.status === 401) {
            handleLogout();
        }

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
        const response = await instance.get(`check/`, {
            withCredentials: true, // Send cookies with the request
        });

        const { user, role } = response.data;
        const { setAuthStatus, setUser } = useAuthStore.getState();

        // Set user and authentication status in Zustand store
        setAuthStatus(true);
        setUser(user, role);

        return response.data;
    } catch (error) {
        const { clearAuth } = useAuthStore.getState();
        clearAuth(); // Reset state on failure
        throw error.response ? error.response.data : error.message;
    }
};


//Logout user
export const logoutUser = async () => {
    try {
        // Backend logout
        await instance.post('logout/');
        Cookies.remove('access_token'); // Assuming 'access_token' is your JWT token stored in cookies.
        Cookies.remove('token'); // Any other custom token you set.

        // You can also clear sessionStorage or localStorage if needed
        sessionStorage.clear();
        localStorage.clear();

        // Clear React state (if applicable)
        const { setAuthStatus, setUser } = useAuthStore.getState();
        setAuthStatus(false);
        setUser(null);

        // Redirect to login
        window.location.href = '/login';
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
        const { setUser } = useAuthStore.getState();
        setUser(response.data);
        return response
    } catch (error) {
        console.error("Error during logout:", error);
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

//Get blogs
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

  
//Get blog details by slug
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

//get comments
export const getComments = async (slug) => {
    try{
        const response = await instance.get(`blog/${slug}/comments/`)
        return response.data
    } catch (error) {
        console.error("Error during posting comment")
        throw error
    }
}

//Create question
export const createQuestion = async (userData) => {
    try {
      const response = await instance.post('question/create/', userData,);
      return response.data;
    } catch (error) {
      console.error('Error during question creation:', error);
  
      throw error.response || error; 
    }
  };

//Get question
export const getQuestion = async (data) => {
    try {
        // console.log("Fetching questions with Params:", data);

        const params = new URLSearchParams(data).toString();

        const response = await instance.get(`questions/?${params}`);
        return response.data;
    } catch (error) {
        console.error("Error during fetching the questions", error);
    }
};

//Get question details by slug
export const questionRead = async (pk) => {
    try{
        const response = await instance.get(`question/${pk}/`)
        return response.data
    } catch (error) {
        console.error("Error during get the question")
        throw error
    }
}

//get answers
export const getAnswers = async (pk) => {
    try{
        const response = await instance.get(`question/${pk}/answers/`)
        return response.data
    } catch (error) {
        console.error("Error during loading answers")
        throw error
    }
}

//post answer
export const postAnswer = async (pk, content) => {
    try{
        const response = await instance.post(`question/${pk}/add-answer/`, {content})
        return response.data
    } catch (error) {
        console.error("Error during posting answer")
        throw error
    }
}

//post vote
export const voteBlog = async (slug, vote) => {
    try{
        const response = await instance.post(`blog/${slug}/vote/`, {vote})
        return response.data
    } catch (error) {
        console.error("Error during posting vote")
        throw error
    }
}

//post question
export const voteQuestion = async (pk, vote) => {
    try{
        const response = await instance.post(`question/${pk}/vote/`, {vote})
        return response.data
    } catch (error) {
        console.error("Error during posting vote")
        throw error
    }
}

//post question
export const usersList = async (data) => {
    try{
        const params = new URLSearchParams(data).toString();

        const response = await instance.get(`users/?${params}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//get user details
export const userDetails = async (id) => {
    try{
        // const params = new URLSearchParams(data).toString();

        const response = await instance.get(`users/${id}/details/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//post report
export const reportUser = async (pk, data) => {
    try{
        const response = await instance.post(`users/${pk}/report/`, data)
        return response.data
    } catch (error) {
        console.error("Error while reporting")
        throw error
    }
}

//Follow or unfollow user
export const followUnfollow = async (pk) => {
    try{
        const response = await instance.post(`users/${pk}/follow-unfollow/`)
        return response.data
    } catch (error) {
        console.error("Error while reporting")
        throw error
    }
}

//user authentication
// export const adminAuth = async () => {
//     try {
//         console.log("Attempting authentication...");
        
//         const response = await instance.get(`ad/`, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             withCredentials: true
//         });
        
//         console.log("Backend response on http only:", response);
//         console.log("Response Headers:", response.headers);
//         console.log("Cookies:", document.cookie);
//         const { setAdminStatus, setUser } = useAdminStore.getState();
//         setAdminStatus(true);
//         return response;
//     } catch (error) {
//         console.error("Authentication Error:", error);
//         console.error("Error Response:", error.response);
//         throw error.response ? error.response.data : error.message;
//     }
// };

// //user authentication
// export const auth = async () => {
//     try {
//         console.log("Attempting authentication...");
        
//         const response = await instance.get(`auth/check/`, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             withCredentials: true
//         });
        
//         console.log("Backend response on http only:", response);
//         console.log("Response Headers:", response.headers);
//         console.log("Cookies:", document.cookie);
//         const { setAuthStatus, setUser } = useAuthStore.getState();
//         setAuthStatus(true);
//         return response;
//     } catch (error) {
//         console.error("Authentication Error:", error);
//         console.error("Error Response:", error.response);
//         throw error.response ? error.response.data : error.message;
//     }
// };
