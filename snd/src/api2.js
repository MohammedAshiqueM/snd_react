import instance from './axios';
import {useAuthStore, useRoleStore} from './store/useAuthStore';
import { clearAllCookies } from './util';
import  Cookies  from 'js-cookie';

export const listPlans = async () => {
    try{
        // const params = new URLSearchParams(data).toString();

        const response = await instance.get('/time-plans/')
        return response.data
    } catch (error) {
        console.error("Error during get the requests")
        throw error
    }
}

export const createOrder = async (id) => {
    try{
        // const params = new URLSearchParams(data).toString();

        const response = await instance.post(`/time-plans/${id}/create-order/`)
        return response.data
    } catch (error) {
        console.error("Error during get the requests")
        throw error
    }
}

export const verifyPayment = async (planId, paymentData) => {
    try {
        const response = await instance.post(`/time-plans/${planId}/verify-payment/`, paymentData);
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
};

export const fetchPurchaseHistory = async () => {
    try {
        const response = await instance.get(`/purchases/`);
        return response;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
    }
  };