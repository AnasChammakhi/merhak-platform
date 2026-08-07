import { Routes, Route } from "react-router-dom";

import Login from './componet/auth/Login.jsx'

function App() {

  return (

    <Routes>

      <Route path="/log" element={<Login />} />

    </Routes>

  );
}

export default App