import { RefObject } from "react";
import prisoner from "../public/prisoner.png";
import prisonerPrison from "../public/prisoner_prison.png";
import prisonerFree from "../public/prisoner_free.png";

const IMG_PRISONER = new Image();
IMG_PRISONER.src = prisoner;

const IMG_PRISONER_PRISON = new Image();
IMG_PRISONER_PRISON.src = prisonerPrison;

const IMG_PRISONER_FREE = new Image();
IMG_PRISONER_FREE.src = prisonerFree;

const MAX_DRAW_FPS = 60;
const MIN_TIME_BETWEEN_DRAW_MS = 1000 / MAX_DRAW_FPS;

class Prisoner {
  id: number;
  foundNumber: boolean;
  isLooking: boolean;
  seenNumbers: number[];
  isFailed: boolean;

  constructor(id: number) {
    this.id = id;
    this.foundNumber = false;
    this.isLooking = false;
    this.seenNumbers = [];
    this.isFailed = false;
  }

  setFoundNumber(found: boolean) {
    this.foundNumber = found;
  }
}

class Simulation {
  private numPrisoners: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null;
  private cancelled: boolean = false;
  private timescaleRef: RefObject<number>;

  private prisoners: Prisoner[];
  private boxes: number[];
  public result: boolean | null = null;
  private tickCount: number = 0;

  constructor(
    numPrisoners: number,
    canvas: HTMLCanvasElement,
    timescaleRef: RefObject<number>
  ) {
    this.numPrisoners = numPrisoners;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.animationFrameId = null;
    this.prisoners = this.createPrisoners();
    this.boxes = this.shuffle([...Array(numPrisoners).keys()]);
    this.timescaleRef = timescaleRef;
  }

  createPrisoners(): Prisoner[] {
    const prisoners: Prisoner[] = [];

    for (let i = 0; i < this.numPrisoners; i++) {
      prisoners.push(new Prisoner(i));
    }

    return prisoners;
  }

  shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  private getGridPosition(index: number, gridSize: number) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return { row, col };
  }

  private drawNumberInBox(
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number,
    number: number
  ) {
    this.ctx.fillStyle = "white";
    this.ctx.font = "12px Arial";

    const { width } = this.ctx.measureText(number.toString());

    this.ctx.fillText(
      number == null ? "?" : (number + 1).toString(),
      x + boxWidth / 2 - width / 2,
      y + boxHeight / 2 + 4
    );
  }

  private draw() {
    if (!this.ctx || !this.canvas) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw rooms
    for (let i = 0; i < 3; i++) {
      this.ctx.strokeRect(
        i * (this.canvas.width / 3),
        0,
        this.canvas.width / 3,
        this.canvas.height
      );
    }

    // Draw prisoners and boxes
    const gridSize = Math.ceil(Math.sqrt(this.numPrisoners));
    const boxWidth = ((this.canvas.width / 3) * 1) / gridSize;
    const boxHeight = boxWidth;
    const prisonerWidth = boxWidth * 0.9;
    const prisonerHeight = prisonerWidth;
    const prisonerOffsetX = boxWidth / 2 - prisonerWidth / 2;
    const prisonerOffsetY = boxHeight / 2 - prisonerHeight / 2;

    // Draw boxes
    this.boxes.forEach((boxNumber, index) => {
      const { row, col } = this.getGridPosition(index, gridSize);
      const x = this.canvas.width / 3 + col * boxWidth;
      const y = row * boxHeight;

      const lookingPrisoner = this.prisoners.find(
        (prisoner) => prisoner.isLooking
      );

      let fillStyle = "#964B00";
      let strokeStyle = "black";
      let numberToDraw = index;

      if (lookingPrisoner) {
        const isLookingAtBox =
          lookingPrisoner.seenNumbers[
            lookingPrisoner.seenNumbers.length - 1
          ] === index;
        const hasSeenBox = lookingPrisoner.seenNumbers.includes(index);

        if (isLookingAtBox) {
          fillStyle = "#7D3F00";
          numberToDraw = boxNumber;
        } else if (hasSeenBox) {
          fillStyle = "#321900";
          numberToDraw = boxNumber;
        }
      }

      this.ctx.fillStyle = fillStyle;
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.fillRect(x, y, boxWidth, boxHeight);
      this.ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Draw box number
      this.drawNumberInBox(x, y, boxWidth, boxHeight, numberToDraw);
    });

    this.prisoners.forEach((prisoner, index) => {
      const { row, col } = this.getGridPosition(index, gridSize);
      const x = col * boxWidth;
      const y = row * boxHeight;

      if (prisoner.foundNumber) {
        // Render prisoner in third room
        this.ctx.drawImage(
          IMG_PRISONER_FREE,
          0,
          0,
          IMG_PRISONER_PRISON.width,
          IMG_PRISONER_PRISON.height,
          x + prisonerOffsetX + (this.canvas.width * 2) / 3,
          y + prisonerOffsetY,
          prisonerWidth,
          prisonerHeight
        );
      } else if (prisoner.isLooking) {
        // Render prisoner on top of the box
        const boxIndex = prisoner.seenNumbers[prisoner.seenNumbers.length - 1];
        const boxPosition = this.getGridPosition(boxIndex, gridSize);
        const boxX = this.canvas.width / 3 + boxPosition.col * boxWidth;
        const boxY = boxPosition.row * boxHeight;

        this.ctx.drawImage(
          IMG_PRISONER,
          0,
          0,
          IMG_PRISONER_PRISON.width,
          IMG_PRISONER_PRISON.height,
          boxX + prisonerOffsetX,
          boxY + prisonerOffsetY,
          prisonerWidth,
          prisonerHeight
        );

        this.drawNumberInBox(
          boxX,
          boxY,
          boxWidth,
          boxHeight,
          this.boxes[boxIndex]
        );
      } else {
        this.ctx.drawImage(
          IMG_PRISONER_PRISON,
          0,
          0,
          IMG_PRISONER_PRISON.width,
          IMG_PRISONER_PRISON.height,
          x + prisonerOffsetX,
          y + prisonerOffsetY,
          prisonerWidth,
          prisonerHeight
        );
      }
    });
  }

  private update() {
    let lookingPrisoner = this.prisoners.find((prisoner) => prisoner.isLooking);
    if (!lookingPrisoner) {
      lookingPrisoner = this.prisoners.find(
        (prisoner) => !prisoner.foundNumber
      );
    }

    if (!lookingPrisoner) {
      return;
    }

    lookingPrisoner.isLooking = true;

    let firstTick = false;
    if (lookingPrisoner.seenNumbers.length === 0) {
      lookingPrisoner.seenNumbers.push(lookingPrisoner.id);
      firstTick = true;
    }

    const lastSeenNumber =
      lookingPrisoner.seenNumbers[lookingPrisoner.seenNumbers.length - 1];

    const nextBoxNumber = this.boxes[lastSeenNumber];

    if (nextBoxNumber === lookingPrisoner.id) {
      lookingPrisoner.isLooking = false;
      lookingPrisoner.setFoundNumber(true);
    } else if (lookingPrisoner.seenNumbers.length === this.numPrisoners / 2) {
      // Maximum allowed number of box openings reached
      lookingPrisoner.isLooking = false;
      lookingPrisoner.isFailed = true;
    } else if (!firstTick) {
      lookingPrisoner.seenNumbers.push(nextBoxNumber);
    }
  }

  lastDraw = 0;

  private async animate() {
    if (this.cancelled) {
      return;
    }
    this.tickCount += 1;
    const now = performance.now();
    const elapsed = now - this.lastDraw;
    this.update();

    if (elapsed > MIN_TIME_BETWEEN_DRAW_MS) {
      this.draw();
      this.lastDraw = now;
    }

    const isSuccessful = this.prisoners.every(
      (prisoner) => prisoner.foundNumber
    );
    const isFailed = this.prisoners.some((prisoner) => prisoner.isFailed);

    if (isSuccessful || isFailed) {
      this.cancel();
      this.result = isSuccessful && !isFailed;
    } else if (!this.cancelled) {
      if (this.timescaleRef.current == null) {
        return;
      }
      if (
        this.timescaleRef.current > 0 ||
        (this.tickCount < 50 && this.tickCount % 10 === 0) ||
        this.tickCount % 25 === 0
      ) {
        setTimeout(() => this.animate(), this.timescaleRef.current);
      } else {
        Promise.resolve(1).then(() => this.animate());
      }
      // this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  public cancel() {
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
    }
    this.cancelled = true;
  }

  async run(): Promise<boolean> {
    return new Promise((resolve) => {
      this.animate();

      // TODO: Implement the logic to decide the outcome of the simulation
      // For now, we just resolve the promise with a random outcome after 5 seconds
      const interval = setInterval(() => {
        if (this.result != null) {
          clearInterval(interval);
          resolve(this.result);
        }
      }, 100);
    });
  }
}

export const runSimulation = (
  numPrisoners: number,
  canvas: HTMLCanvasElement,
  timescaleRef: RefObject<number>
): { result: Promise<boolean>; cancel: () => void } => {
  const simulation = new Simulation(numPrisoners, canvas, timescaleRef);
  return {
    result: simulation.run(),
    cancel: () => {
      simulation.cancel();
    },
  };
};
