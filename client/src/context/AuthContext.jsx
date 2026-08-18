import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
  resetCsrfToken,
} from "../lib/api";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  async function refreshUser() {
    try {
      const data =
        await apiFetch(
          "/auth/me"
        );

      setUser(
        data.user
      );
    } catch (error) {
      if (
        error.status === 401
      ) {
        setUser(null);
      } else {
        console.error(
          error
        );
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    refreshUser();
  }, []);


  async function login(
    email,
    password
  ) {
    const data =
      await apiFetch(
        "/auth/login",
        {
          method: "POST",

          body: {
            email,
            password,
          },
        }
      );


    /*
      Login regenerates the server session,
      so the old CSRF token no longer belongs
      to the new session.
    */
    resetCsrfToken();


    setUser(
      data.user
    );


    return data.user;
  }


  async function register(
    formData
  ) {
    return apiFetch(
      "/auth/register",
      {
        method: "POST",

        body: formData,
      }
    );
  }


  async function logout() {
    try {
      await apiFetch(
        "/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      resetCsrfToken();
      setUser(null);
    }
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);


  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }


  return context;
}