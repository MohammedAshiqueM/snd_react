import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { googleSignin } from '../api';
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie';

const GoogleAuth = () => {
    const navigate = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    if (credential) {
      console.log('Google credential:', credential);
      Cookies.set('token', credential, { secure: true, sameSite: 'Lax' });
      try {
        const data = await googleSignin(credential);
        console.log('Server response:', data);
        navigate('/home')
      } catch (error) {
        console.error('Login failed:', error);
      }
    } else {
      console.error('Credential not received');
    }
  };

  const handleFailure = (error) => {
    if (error && error.details) {
      console.warn('Google Login failed:', error.details);
    } else {
      console.error('Google Login Error:', error);
    }
    alert('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="435363074413-hm923kr7srvj4b5iqj54f78i1gcu8p36.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
        useOneTap
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
