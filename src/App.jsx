import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/login";
import InicioAdmin from "./pages/admin/inicioAdmin";
import InicioAlimentador from "./pages/alimentador/inicioAlim";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<InicioAdmin />} />

        <Route
          path="/alimentador"
          element={<InicioAlimentador />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;