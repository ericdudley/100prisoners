import { Box, Prisoner, Strategy } from "./models";

export type StrategyFunction = (boxes: Box[], prisoner: Prisoner) => Box;

export const STRATEGY_OPTIONS: Strategy[] = [
  {
    label: "Optimal",
    value: "optimal",
    description:
      "Each prisoner opens the drawer labelled with their number first, then opens the drawer labelled with the number inside the drawer they just opened until they find their number or run out of attempts.",
  },
  {
    label: "Random",
    value: "random",
    description: "Each prisoner opens drawers at random",
  },
];

export const STRATEGY_FUNCTIONS: Record<Strategy["value"], StrategyFunction> = {
  random: (boxes, _prisoner) => {
    const notSeenBoxes = boxes.filter((box) => !box.isSeen);
    return notSeenBoxes[Math.floor(Math.random() * notSeenBoxes.length)];
  },
  optimal: (boxes, prisoner) => {
    const lastSeenBox = prisoner.seenBoxes[prisoner.seenBoxes.length - 1];
    if (!lastSeenBox) {
      return boxes[prisoner.id];
    }
    const lastSeenBoxNumber = lastSeenBox.number;
    return boxes[lastSeenBoxNumber];
  },
};
