import prisoner from "../public/prisoner.png";
import prisonerPrison from "../public/prisoner_prison.png";
import prisonerFree from "../public/prisoner_free.png";

export const IMG_PRISONER = new Image();
IMG_PRISONER.src = prisoner;

export const IMG_PRISONER_PRISON = new Image();
IMG_PRISONER_PRISON.src = prisonerPrison;

export const IMG_PRISONER_FREE = new Image();
IMG_PRISONER_FREE.src = prisonerFree;

export const MAX_DRAW_FPS = 60;
export const MIN_TIME_BETWEEN_DRAW_MS = 1000 / MAX_DRAW_FPS;

export const MAX_PRISONERS = 2000;

function darkenColor(color: string, percent: number) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const DARKEN_PERCENT = 25;

function getColor(color: string) {
  return { light: color, dark: darkenColor(color, DARKEN_PERCENT) };
}

export const CYCLE_ID_TO_COLOR = [
  getColor("#3C6E71"),
  getColor("#B56576"),
  getColor("#798234"),
  getColor("#446CB3"),
  getColor("#BD7B46"),
  getColor("#6B818C"),
  getColor("#A7A37E"),
  getColor("#955251"),
  getColor("#476A6F"),
  getColor("#935116"),
];
