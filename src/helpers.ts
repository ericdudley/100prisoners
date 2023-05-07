import { CYCLE_ID_TO_COLOR } from "./constants";
import { Box } from "./models";

export type BoxCycles = {
  [key: number]: {
    cycleColor: string;
    cycleBoxId: number;
  };
};

function getById(id: number, remaining: Box[]) {
  return remaining.find((box) => box.id === id);
}

function createNewBox(box: Box) {
  const newBox = new Box(box.id, box.number);
  newBox.isSeen = box.isSeen;
  return newBox;
}

function createCycles(remaining: Box[]) {
  const cycles = [];

  while (remaining.length > 0) {
    const first = remaining.shift()!;
    let cycle = [first];
    let curr = getById(first.number, remaining);
    while (curr && curr.id !== first.id) {
      remaining = remaining.filter((box) => box.id !== curr!.id);
      cycle.push(curr);
      curr = getById(curr.number, remaining);
    }
    cycles.push(cycle);
  }

  return cycles;
}

function flattenCycles(cycles: Box[][]) {
  let cycleCount = -1;

  cycles.sort((a, b) => b.length - a.length);

  return cycles.reduce((acc, cycle) => {
    cycleCount++;
    return acc.concat(
      cycle.map((box) => ({
        cycleId: cycleCount,
        box,
      }))
    );
  }, [] as { cycleId: number; box: Box }[]);
}

export function getBoxCycles(boxes: Box[]): BoxCycles {
  const remaining = boxes.map(createNewBox);
  const cycles = createCycles(remaining);
  const flattened = flattenCycles(cycles);

  return boxes.reduce((boxMap, box) => {
    const mappedBoxIndex = flattened.findIndex((b) => b.box.id === box.id);
    const mappedBox = flattened[mappedBoxIndex];
    boxMap[box.id] = {
      cycleColor: getCycleColor(mappedBox.cycleId),
      cycleBoxId: mappedBoxIndex,
    };
    return boxMap;
  }, {} as BoxCycles);
}

export function getCycleColor(cycleId: number): string {
  return CYCLE_ID_TO_COLOR[cycleId % CYCLE_ID_TO_COLOR.length];
}
