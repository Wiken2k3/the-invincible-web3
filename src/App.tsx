import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
// import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
// import Reward from "./pages/Reward";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          {/* <Route path="/reward" element={<Reward />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}