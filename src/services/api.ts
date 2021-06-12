import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      
      cookies = parseCookies();
      const { 'nextauth.refreshToken': refreshToken } = cookies;

      const originalConfig = error.config;

      if (!isRefreshing) {
        isRefreshing = true;
        api.post('/refresh', {
          refreshToken,
        }).then(response => {
  
          setCookie(undefined, 'nextauth.token', response.data.token, {
            maxAge:  60 * 60 * 24 * 30,
            path: '/'
          })
    
          setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
            maxAge:  60 * 60 * 24 * 30,
            path: '/'
          })
  
          api.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;

          failedRequestQueue.forEach(request => request.onSuccess(response.data.token));
          failedRequestQueue = [];
        }).catch(err => {
          failedRequestQueue.forEach(request => request.onError(err));
          failedRequestQueue = [];
        }).finally(() => {
          isRefreshing = false;
        })
      }

      return new Promise((resolve, reject) => {
        failedRequestQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          onError: (err: AxiosError) => {
            reject(err);
          },
        })
      })
    } else {
      signOut();
    }
  }
  return Promise.reject(error);
})