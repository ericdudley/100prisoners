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
