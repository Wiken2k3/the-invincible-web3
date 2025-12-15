import { WHEEL_ITEMS } from "./wheel.config";

export function spinWheel() {
  const index = Math.floor(Math.random() * WHEEL_ITEMS.length);
  const anglePerItem = 360 / WHEEL_ITEMS.length;

  return {
    index,
    reward: WHEEL_ITEMS[index],
    rotateDeg: 360 * 5 + index * anglePerItem + anglePerItem / 2,
  };
}
