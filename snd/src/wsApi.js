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

        const response = await instance.get(`ws-handshake/${currentUser}/${user_id}`);
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