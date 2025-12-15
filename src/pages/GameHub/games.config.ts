import Dice from "../../pages/Game/Dice/Dice";
import HorseRace from "../../pages/Game/HorseRace/HorseRace";
import Mine from "../../pages/Game/Mine/Mines";
import Slot from "../../pages/Game/Slot/SlotMachine";
import TaiXiu from "../../pages/Game/TaiXiu/TaiXiu";
import Tower from "../../pages/Game/Tower/Tower";
import Wheel from "../../pages/Game/Wheel/Wheel";

export const games = [
  {
    key: "dice",
    name: "🎲 Dice",
    path: "/game/dice",
    component: Dice,
  },
  {
    key: "horse-race",
    name: "🐎 Horse Race",
    path: "/game/horse-race",
    component: HorseRace,
  },
  {
    key: "mine",
    name: "💣 Mine",
    path: "/game/mine",
    component: Mine,
  },
  {
    key: "slot",
    name: "🎰 Slot Machine",
    path: "/game/slot",
    component: Slot,
  },
  {
    key: "tai-xiu",
    name: "🎲 Tài Xỉu",
    path: "/game/tai-xiu",
    component: TaiXiu,
  },
  {
    key: "tower",
    name: "🗼 Tower",
    path: "/game/tower",
    component: Tower,
  },
  {
    key: "wheel",
    name: "🎡 Wheel Spin",
    path: "/game/wheel",
    component: Wheel,
  },
];
