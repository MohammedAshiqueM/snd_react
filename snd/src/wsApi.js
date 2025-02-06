import instance from './axios';
// import useAdminStore from './store/useAdminStore';
import {useAuthStore, useRoleStore} from './store/useAuthStore';
import { clearAllCookies } from './util';
import  Cookies  from 'js-cookie';


//user signup
export const chat = async (user_id) => {
    try {
        const currentUser = useAuthStore.getState().user?.id; // Get current user's ID from Zustand store
        console.log("current user",currentUser)
        if (!currentUser) {
            throw new Error("User is not authenticated or user ID is missing.");
        }

        const response = await instance.get(`ws-handshake/${currentUser}/${user_id}/`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};

export const notificationHandshake = async () => {
    try {
        const currentUser = useAuthStore.getState().user?.id; // Get current user's ID from Zustand store
        console.log("current user",currentUser)
        if (!currentUser) {
            throw new Error("User is not authenticated or user ID is missing.");
        }

        const response = await instance.get(`notification-handshake/${currentUser}/`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};
//list all users
export const allUsers = async ({ page = 1, search = '' }) => {
    try {
      const response = await instance.get(`all-users/`, {
        params: {
          page,
          search
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error during listing users:", error);
      throw error;
    }
  };

export const markMessagesAsRead = async (id) => {
    try{

        const response = await instance.post(`mark/${id}/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

export const onlineStatus = async () => {
    try{

        const response = await instance.get(`onlilne-status/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

export const notifications = async () => {
    try{

        const response = await instance.get(`notifications/unread_count/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

export const addNotifications = async (id) => {
    try{

        const response = await instance.get(`notifications/${id}/mark_read/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

export const markAllNotifications = async (id) => {
    try{

        const response = await instance.get(`notifications/mark_all_read/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//Create Session
export const createPropose = async (userData) => {
    try {
      const response = await instance.post('propose/', userData,);
      return response.data;
    } catch (error) {
      console.error('Error during question creation:', error);
  
      throw error.response || error; 
    }
  };

//Create Session
export const classList = async (userData) => {
    try {
      const response = await instance.get('propose/', userData,);
      return response.data;
    } catch (error) {
      console.error('Error during question creation:', error);
  
      throw error.response || error; 
    }
  };


export const getSchedulesForRequest = async (requestId) => {
    const response = await instance.get(`requests/${requestId}/propose/`);
    return response.data;
  };
  
export const updateScheduleStatus = async (scheduleId, status) => {
    const response = await instance.patch(`propose/${scheduleId}/`, { status });
    return response.data;
};

export const sendProposes = async (data) => {

    console.log("Fetching send proposal with Params:", data);

    const params = new URLSearchParams(data).toString();

    const response = await instance.get(`propose/send/?${params}`);
    return response.data;
  };
  
export const receivedProposes = async (data) => {
    const params = new URLSearchParams(data).toString();

    const response = await instance.get(`propose/receved/?${params}`);
    return response.data;
};
  
export const learningSession = async (data) => {
    const params = new URLSearchParams(data).toString();

    const response = await instance.get(`schedules/learning/?${params}`);
    return response.data;
};

export const teachingSession = async (data) => {
    const params = new URLSearchParams(data).toString();

    const response = await instance.get(`schedules/teaching/?${params}`);
    return response.data;
};

export const joinMeet = async (schedule_id) => {
    console.log("here inside")
    const response = await instance.post(`meeting/${schedule_id}/join/`);
    return response.data;
};

export const verifyMeet = async (schedule_id) => {
    console.log("here inside")
    const response = await instance.get(`meeting/${schedule_id}/verify/`);
    return response.data;
};

export const ratingUser = async (data) => {
    console.log("here inside")
    const response = await instance.post(`ratings/`,data);
    return response.data;
};

export const meetDetails = async (id) => {
    const response = await instance.get(`session/${id}`);
    return response.data
};

export const transferTime = async (data) => {
    console.log("here inside")
    const response = await instance.post(`transfer-time/`,data);
    return response.data;
};
