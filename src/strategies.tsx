import { Box, Prisoner, Strategy } from "./models";

export type StrategyFunction = (boxes: Box[], prisoner: Prisoner) => Box;

export const STRATEGY_OPTIONS: Strategy[] = [
  {
    label: "Optimal",
    value: "optimal",
    description: (
      <>
        <p className="mb-2">
          Each prisoner first opens the drawer labeled with their own number.
          They then open the drawer labeled with the number found in the
          previously opened drawer. They continue this process until they either
          find their own number or exhaust their allowed attempts. This strategy
          offers a survival probability of around 30%.
        </p>
        <p>
          The success of this strategy lies in the prisoners following a cycle
          in the drawers, ultimately leading to the drawer containing their
          number. A prisoner would fail to find their number only if it belongs
          to a cycle longer than their allowed attempts. The probability of such
          a cycle existing is approximately 70%.
        </p>
      </>
    ),
  },
  {
    label: "Random",
    value: "random",
    description: (
      <>
        <p className="mb-2">
          Each prisoner opens drawers at random. In this random strategy, the
          probability of all prisoners finding their numbers and winning is
          extremely low (around 1 in 2^100).
        </p>
        <p>
          The prisoners do not use any specific pattern or information to open
          the drawers, which makes their chances of winning significantly lower
          compared to the optimal strategy. It's like flipping a coin 100 times
          and getting heads every time.
        </p>
      </>
    ),
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
