// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import MissionDetails from "./components/MissionDetails"; 
import ProtectedRoute from "./components/ProtectedRoute"; 

// Pages
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Missions from "./pages/Missions";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Trips from "./pages/Trips";
import Logout from "./pages/Logout";
import CareerPanel from "./pages/CareerPanel";
import Sorteio from "./pages/RafflePage";

export default function App() {
  return (
    <Router>
      <div className="bg-white text-dark min-h-screen">
        <Navbar />
        <Routes>
          
          {/* 1. 🌍 ROTAS PÚBLICAS (Acessíveis a todos) */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/quiz" element={<Quiz />} /> 
          <Route path="/trips" element={<Trips />} /> {/* Se Trips não precisar de login */}
          
          {/* ------------------------------------------------------------- */}
          
          {/* 2. 🔒 ROTAS PROTEGIDAS (Apenas para usuários Logados) */}
          <Route element={<ProtectedRoute />}>
            {/* 🗺️ Rotas de Conteúdo/Gamificação Protegidas */}
            <Route path="/missions" element={<Missions />} />
            <Route path="/missao/:id" element={<MissionDetails />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/carreira" element={<CareerPanel />} />
            <Route path="/sorteio" element={<Sorteio />} />

            {/* 👤 Rotas de Perfil Protegidas */}
            <Route path="/profile" element={<Profile />} />

            {/* 🔑 Rota de Administração Protegida */}
            <Route path="/admin" element={<Admin />} />

          </Route>
          
        </Routes>
      </div>
    </Router>
  );
}