import { auth } from "./api";
import axios from "./axios";
import React from "react";


export const AuthCall = async () => {
    try{
        const response = await auth();
        return response?.data?.isAuthenticated  || false
    }
    catch(error){
        console.log(error)
        if (error.response?.status === 401) {
            console.warn('User not authenticated, redirecting to login...');
          }
          return false;
        }
      
    
}
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
  
  