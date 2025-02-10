import instance from './axios';
// import useAdminStore from './store/useAdminStore';
import {useAuthStore, useRoleStore} from './store/useAuthStore';
import { clearAllCookies } from './util';
import  Cookies  from 'js-cookie';

//list reported users
export const reportList = async (data) => {
    try{
        const params = new URLSearchParams(data).toString();

        const response = await instance.get(`dashboard/reports/?${params}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//list report details
export const reportDetails = async (pk) => {
    try{
        const response = await instance.get(`dashboard/report/${pk}/details/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//list report details
export const blockUser = async (pk) => {
    try{
        const response = await instance.post(`dashboard/user/${pk}/block-unblock/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//list tags
export const tagList = async (data) => {
    try{
        const params = new URLSearchParams(data).toString();
        const response = await instance.get(`dashboard/tags/?${params}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

//add tags
export const addTag = async (data) => {
    try{
        const response = await instance.post(`dashboard/tag/add/`,data)
        console.log(response)
        return response.data
    } catch (error) {
        console.error("Error during listing users")
        throw error
    }
}

export const paymentPlans = async () => {
    try {
        const response = await instance.get('dashboard/time-plans/');
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
  };

export const addPlans = async (data) => {
    try {
        const response = await instance.post('dashboard/time-plans/',data);
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
  };

  export const updatePlan = async (id,data) => {
    try {
        const response = await instance.put(`dashboard/time-plans/${id}/`,data);
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
  };

  export const getTransactionHistory = async (page = 1, pageSize = 10) => {
    try {
      const response = await instance.get(`dashboard/time/purchases/`, {
        params: { page, page_size: pageSize }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  };