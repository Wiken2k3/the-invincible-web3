import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";


import Home from "../pages/Home/Home";
import GameHub from "../pages/GameHub/GameHub";

import HorseRace from "../pages/Game/HorseRace/HorseRace";
import Dice from "../pages/Game/Dice/Dice";
import WheelSpin from "../pages/Game/Wheel/WheelSpin";
import TaiXiu from "../pages/Game/TaiXiu/TaiXiu";
import Tower from "../pages/Game/Tower/Tower";
import Mine from "../pages/Game/Mine/Mines";
import SlotMachine from "../pages/Game/Slot/SlotMachine";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/game", element: <GameHub /> },

      { path: "/game/horse-race", element: <HorseRace /> },
      { path: "/game/dice", element: <Dice /> },
      { path: "/game/wheel", element: <WheelSpin /> },
      { path: "/game/tai-xiu", element: <TaiXiu /> },
      { path: "/game/tower", element: <Tower /> },
      { path: "/game/mine", element: <Mine /> },
      { path: "/game/slot", element: <SlotMachine /> },
    ],
  },
]);
