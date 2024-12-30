import { auth } from "./api";
import axios from "./axios";
import React from "react";


// export const AuthCall = async () => {
//     try {
//         const response = await auth(); // Ensure `auth()` works as expected
//         console.log('API Response:', response?.data);
//         return response?.data?.isAuthenticated || false;
//     } catch (error) {
//         console.error('AuthCall Error:', error);
//         const localState = JSON.parse(localStorage.getItem('auth-store'));
//         return localState?.state?.isAuthenticated || false;
//     }
// };


// export const AuthCall = async () => {
//     try {
//       const response = await fetch('http://localhost:8000/auth/check', {
//         method: 'GET',
//         credentials: 'include' // Required to send cookies
//       });
  
//       if (!response.ok) {
//         if (response.status === 401) {
//           console.warn('User not authenticated, redirecting to login...');
//           return false;
//         }
//         throw new Error('Network response was not ok ' + response.statusText);
//       }
  
//       const data = await response.json();
//       return data.isAuthenticated || false;
//     } catch (error) {
//       console.log(error);
//       return false;
//     }
//   };
  
  