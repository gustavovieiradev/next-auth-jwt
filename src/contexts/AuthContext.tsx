import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "../services/apiClient";

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push('/')
}

export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');
    
    authChannel.onmessage = (message: MessageEvent) => {
      switch (message.data) {
        case 'signOut':
          Router.push('/');
          break;
        case 'signIn':
          Router.push('/dashboard');
          break;
        default: 
          break;
      }
    }
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api.get('me').then(response => {
        const {email, permissions, roles} = response.data;
        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() => {
        signOut()
      })
    }
  }, [])

  async function signIn({email, password}: SignInCredentials): Promise<void> {
    try {
      const response = await api.post('sessions', {
        email,
        password
      });
      
      const {token, refreshToken, permissions, roles} = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge:  60 * 60 * 24 * 30,
        path: '/'
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge:  60 * 60 * 24 * 30,
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      Router.push('/dashboard');
      authChannel.postMessage('signIn'); 

    } catch(err) {
      console.error(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);