import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home/Home";
import Reward from "./pages/Reward/Reward";

import GameHub from "./pages/GameHub/GameHub";
import { games } from "./pages/GameHub/games.config";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<GameHub />} />
          <Route path="/reward" element={<Reward />} />

          {/* AUTO GAME ROUTES */}
          {games.map((game) => (
            <Route
              key={game.key}
              path={game.path}
              element={<game.component />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
