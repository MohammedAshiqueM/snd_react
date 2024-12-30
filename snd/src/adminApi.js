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