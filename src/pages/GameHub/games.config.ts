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
    name: "Dice",
    icon: "🎲",
    description: "Roll the dice and test your luck",
    path: "/game/dice",
    gradient: "linear-gradient(135deg,#6366f1,#22d3ee)",
    component: Dice,
  },
  {
    key: "horse-race",
    name: "Horse Race",
    icon: "🐎",
    description: "Bet on the fastest horse",
    path: "/game/horse-race",
    gradient: "linear-gradient(135deg,#f97316,#facc15)",
    component: HorseRace,
  },
  {
    key: "mine",
    name: "Mine",
    icon: "💣",
    description: "Avoid bombs – maximize rewards",
    path: "/game/mine",
    gradient: "linear-gradient(135deg,#ef4444,#f43f5e)",
    component: Mine,
  },
  {
    key: "slot",
    name: "Slot Machine",
    icon: "🎰",
    description: "Spin to win big prizes",
    path: "/game/slot",
    gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
    component: Slot,
  },
  {
    key: "tai-xiu",
    name: "Tài Xỉu",
    icon: "🎲",
    description: "Classic Asian betting game",
    path: "/game/tai-xiu",
    gradient: "linear-gradient(135deg,#22c55e,#16a34a)",
    component: TaiXiu,
  },
  {
    key: "tower",
    name: "Tower",
    icon: "🗼",
    description: "Climb higher, risk higher",
    path: "/game/tower",
    gradient: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
    component: Tower,
  },
  {
    key: "wheel",
    name: "Wheel Spin",
    icon: "🎡",
    description: "Spin the wheel of fortune",
    path: "/game/wheel",
    gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)",
    component: Wheel,
  },
];
