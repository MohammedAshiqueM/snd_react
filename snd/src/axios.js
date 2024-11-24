import axios from 'axios'
import {baseUrl} from './constants/constant'

const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  export default instance
  