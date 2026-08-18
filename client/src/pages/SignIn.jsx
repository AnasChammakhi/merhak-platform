import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";


import Navbar from "../components/Navbar";

import {
  useAuth,
} from "../context/AuthContext";


function SignIn() {
  const navigate =
    useNavigate();


  const {
    user,
    loading: authLoading,
    login,
  } = useAuth();


  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  if (authLoading) {
    return null;
  }


  if (user) {
    return (
      <Navigate
        to={
          user.role === "ADMIN"
            ? "/admin"
            : "/"
        }
        replace
      />
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setMessage("");
    setLoading(true);


    try {
      const connectedUser =
        await login(
          email,
          password
        );


      navigate(
        connectedUser.role ===
          "ADMIN"
          ? "/admin"
          : "/"
      );
    } catch (error) {
      setMessage(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#f7fbfe]">

      <Navbar />


      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16">

        <div className="w-full max-w-md">

          <div className="mb-9 text-center">

            <p className="section-label">
              MERHAK
            </p>

            <h1 className="mt-4 text-4xl font-semibold text-[#10212f]">
              Heureux de vous revoir
            </h1>

            <p className="mt-3 text-sm text-[#667785]">
              Connectez-vous à votre espace personnel.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-3xl bg-white p-8 shadow-sm md:p-10"
          >

            <label className="form-label">
              Adresse e-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              className="form-input"
              placeholder="vous@exemple.com"
              required
            />


            <label className="form-label mt-6">
              Mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              className="form-input"
              placeholder="••••••••••"
              required
            />


            {message && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </p>
            )}


            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-8 w-full"
            >
              {loading
                ? "Connexion..."
                : "Se connecter"}
            </button>


            <p className="mt-7 text-center text-sm text-[#667785]">
              Pas encore de compte ?{" "}

              <Link
                to="/signup"
                className="font-semibold text-[#0f73c4] hover:text-[#29b6f6]"
              >
                Créer un compte
              </Link>
            </p>

          </form>

        </div>

      </section>

    </div>
  );
}


export default SignIn;