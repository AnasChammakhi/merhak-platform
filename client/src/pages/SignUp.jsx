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


function SignUp() {
  const navigate =
    useNavigate();


  const {
    user,
    loading: authLoading,
    register,
  } = useAuth();


  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });


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
        to="/"
        replace
      />
    );
  }


  function handleChange(
    event
  ) {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setMessage("");


    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage(
        "Les mots de passe ne correspondent pas."
      );

      return;
    }


    setLoading(true);


    try {
      await register({
        name:
          formData.name,

        email:
          formData.email,

        phone:
          formData.phone,

        address:
          formData.address,

        password:
          formData.password,
      });


      navigate(
        "/signin"
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

        <div className="w-full max-w-lg">

          <div className="mb-9 text-center">

            <p className="section-label">
              MERHAK
            </p>

            <h1 className="mt-4 text-4xl font-semibold text-[#10212f]">
              Créer votre compte
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#667785]">
              Retrouvez vos commandes et profitez
              d'un espace dédié à vos créations
              sur mesure.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-3xl bg-white p-8 shadow-sm md:p-10"
          >

            <div className="grid gap-6 sm:grid-cols-1">

              <div>
                <label className="form-label">
                  Nom complet
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  className="form-input"
                  required
                />
              </div>

            </div>


            <label className="form-label mt-6">
              Adresse e-mail
            </label>

            <input
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              className="form-input"
              required
            />


            <label className="form-label mt-6">
              Téléphone
            </label>

            <input
              type="tel"
              name="phone"
              value={
                formData.phone
              }
              onChange={
                handleChange
              }
              className="form-input"
              placeholder="+216 XX XXX XXX"
              required
            />

            <label className="form-label mt-6">
              Adresse
            </label>

            <input
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              className="form-input"
              required
            />


            <label className="form-label mt-6">
              Mot de passe
            </label>

            <input
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              className="form-input"
              minLength="10"
              required
            />

            <p className="mt-2 text-xs text-[#8797a4]">
              Au moins 10 caractères.
            </p>


            <label className="form-label mt-6">
              Confirmer le mot de passe
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={
                formData.confirmPassword
              }
              onChange={
                handleChange
              }
              className="form-input"
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
                ? "Création..."
                : "Créer mon compte"}
            </button>


            <p className="mt-7 text-center text-sm text-[#667785]">
              Vous avez déjà un compte ?{" "}

              <Link
                to="/signin"
                className="font-semibold text-[#0f73c4] hover:text-[#29b6f6]"
              >
                Se connecter
              </Link>
            </p>

          </form>

        </div>

      </section>

    </div>
  );
}


export default SignUp;