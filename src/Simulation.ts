import { RefObject } from "react";
import {
  CYCLE_ID_TO_COLOR,
  IMG_PRISONER,
  IMG_PRISONER_FREE,
  IMG_PRISONER_PRISON,
  MIN_TIME_BETWEEN_DRAW_MS,
} from "./constants";
import { BoxCycles, getBoxCycles } from "./helpers";
import { Box, Prisoner, Strategy } from "./models";
import { STRATEGY_FUNCTIONS } from "./strategies";

function clearCtx(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export class Simulation {
  private prisonCanvas: HTMLCanvasElement;
  private prisonCtx: CanvasRenderingContext2D;
  private lookingCanvas: HTMLCanvasElement;
  private lookingCtx: CanvasRenderingContext2D;
  private freeCanvas: HTMLCanvasElement;
  private freeCtx: CanvasRenderingContext2D;

  private timeoutId: number | undefined;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private tickMsRef: RefObject<number>;
  private showCyclesRef: RefObject<boolean>;

  private strategy: Strategy;
  private prisoners: Prisoner[];
  private boxes: Box[];
  private boxCycles: BoxCycles;
  private tickCount: number = 0;

  private resultCallback: (result: boolean | undefined) => void = () => {};

  constructor(
    numPrisoners: number,
    strategy: Strategy,
    prisonCanvas: HTMLCanvasElement,
    lookingCanvas: HTMLCanvasElement,
    freeCanvas: HTMLCanvasElement,
    timescaleRef: RefObject<number>,
    showCyclesRef: RefObject<boolean>
  ) {
    this.prisonCanvas = prisonCanvas;
    this.prisonCtx = prisonCanvas.getContext("2d")!;
    this.lookingCanvas = lookingCanvas;
    this.lookingCtx = lookingCanvas.getContext("2d")!;
    this.freeCanvas = freeCanvas;
    this.freeCtx = freeCanvas.getContext("2d")!;

    this.timeoutId = undefined;
    this.tickMsRef = timescaleRef;
    this.showCyclesRef = showCyclesRef;

    this.strategy = strategy;

    // Initialize prisoners with id equal to index
    this.prisoners = Array(numPrisoners)
      .fill(0)
      .map((_, idx) => new Prisoner(idx));

    // Initialize boxes and shuffle
    const boxes = [...Array(numPrisoners).keys()];
    for (let i = boxes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [boxes[i], boxes[j]] = [boxes[j], boxes[i]];
    }
    this.boxes = boxes.map((boxNumber, boxIdx) => new Box(boxIdx, boxNumber));
    this.boxCycles = getBoxCycles(this.boxes);
  }

  private getGridPosition(index: number, gridSize: number) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return { row, col };
  }

  private drawNumberInBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number,
    number: number
  ) {
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";

    const { width } = ctx.measureText(number.toString());

    ctx.fillText(
      number == null ? "?" : (number + 1).toString(),
      x + boxWidth / 2 - width / 2,
      y + boxHeight / 2 + 4
    );
  }

  private getSize(canvas: HTMLCanvasElement) {
    const gridSize = Math.ceil(Math.sqrt(this.prisoners.length));
    const boxWidth = canvas.width / gridSize;
    const boxHeight = boxWidth;
    const prisonerWidth = boxWidth * 0.9;
    const prisonerHeight = prisonerWidth;
    const prisonerOffsetX = boxWidth / 2 - prisonerWidth / 2;
    const prisonerOffsetY = boxHeight / 2 - prisonerHeight / 2;

    return {
      gridSize,
      boxWidth,
      boxHeight,
      prisonerWidth,
      prisonerHeight,
      prisonerOffsetX,
      prisonerOffsetY,
    };
  }

  private drawPrisonCanvas() {
    if (!this.prisonCtx || !this.prisonCanvas) {
      return;
    }

    clearCtx(this.prisonCtx);

    // Draw room
    this.prisonCtx.strokeStyle = "black";
    this.prisonCtx.strokeRect(
      0,
      0,
      this.prisonCanvas.width,
      this.prisonCanvas.height
    );

    const {
      gridSize,
      boxWidth,
      boxHeight,
      prisonerWidth,
      prisonerHeight,
      prisonerOffsetX,
      prisonerOffsetY,
    } = this.getSize(this.prisonCanvas);

    // Draw prisoners
    this.prisoners
      .filter((prisoner) => prisoner.status === "prison")
      .forEach((prisoner) => {
        const { row, col } = this.getGridPosition(prisoner.id, gridSize);
        const x = col * boxWidth;
        const y = row * boxHeight;

        this.prisonCtx.drawImage(
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
      });
  }

  private drawLookingCanvas() {
    if (!this.lookingCtx || !this.prisonCanvas) {
      return;
    }

    clearCtx(this.lookingCtx);

    // Draw room
    this.lookingCtx.strokeStyle = "black";
    this.lookingCtx.strokeRect(
      0,
      0,
      this.lookingCanvas.width,
      this.lookingCanvas.height
    );

    const {
      gridSize,
      boxWidth,
      boxHeight,
      prisonerWidth,
      prisonerHeight,
      prisonerOffsetX,
      prisonerOffsetY,
    } = this.getSize(this.lookingCanvas);

    // Draw boxes
    this.boxes.forEach((box) => {
      const { cycleColor, cycleBoxId } = this.boxCycles[box.id];
      const { row, col } = this.getGridPosition(
        this.showCyclesRef.current ? cycleBoxId : box.id,
        gridSize
      );
      const x = col * boxWidth;
      const y = row * boxHeight;

      const fillStyle = box.isSeen
        ? "#321900"
        : this.showCyclesRef.current
        ? cycleColor
        : CYCLE_ID_TO_COLOR[0];

      this.lookingCtx.fillStyle = fillStyle;
      this.lookingCtx.strokeStyle = "black";
      this.lookingCtx.fillRect(x, y, boxWidth, boxHeight);
      this.lookingCtx.strokeRect(x, y, boxWidth, boxHeight);

      // Draw box number
      this.drawNumberInBox(
        this.lookingCtx,
        x,
        y,
        boxWidth,
        boxHeight,
        box.number
      );
    });

    // Draw prisoners
    this.prisoners
      .filter((prisoner) => prisoner.status === "looking")
      .forEach((prisoner) => {
        const GHOST_LENGTH = 10;
        const drawPositions = prisoner.seenBoxes.slice(
          prisoner.seenBoxes.length >= GHOST_LENGTH
            ? prisoner.seenBoxes.length - GHOST_LENGTH
            : 0
        );

        drawPositions.forEach((box, seenIdx) => {
          const { cycleBoxId } = this.boxCycles[box.id];

          // Render prisoner on top of the box
          const boxPosition = this.getGridPosition(
            this.showCyclesRef.current ? cycleBoxId : box.id,
            gridSize
          );
          const boxX = boxPosition.col * boxWidth;
          const boxY = boxPosition.row * boxHeight;

          const seenRatio =
            (drawPositions.length < GHOST_LENGTH
              ? seenIdx + (GHOST_LENGTH - drawPositions.length)
              : seenIdx) / GHOST_LENGTH;
          const alphaValue = seenRatio * seenRatio;
          this.lookingCtx.globalAlpha = alphaValue;
          this.lookingCtx.drawImage(
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
          this.lookingCtx.globalAlpha = 1;
        });
      });
  }

  private drawFreeCanvas() {
    if (!this.freeCtx || !this.freeCanvas) {
      return;
    }

    clearCtx(this.freeCtx);

    // Draw room
    this.freeCtx.strokeStyle = "black";
    this.freeCtx.strokeRect(
      0,
      0,
      this.freeCanvas.width,
      this.freeCanvas.height
    );

    const {
      gridSize,
      boxWidth,
      boxHeight,
      prisonerWidth,
      prisonerHeight,
      prisonerOffsetX,
      prisonerOffsetY,
    } = this.getSize(this.freeCanvas);

    // Draw prisoners
    this.prisoners
      .filter((prisoner) => prisoner.status === "free")
      .forEach((prisoner) => {
        const { row, col } = this.getGridPosition(prisoner.id, gridSize);
        const x = col * boxWidth;
        const y = row * boxHeight;

        this.freeCtx.drawImage(
          IMG_PRISONER_FREE,
          0,
          0,
          IMG_PRISONER_FREE.width,
          IMG_PRISONER_FREE.height,
          x + prisonerOffsetX,
          y + prisonerOffsetY,
          prisonerWidth,
          prisonerHeight
        );
      });
  }

  public draw() {
    this.drawPrisonCanvas();
    this.drawLookingCanvas();
    this.drawFreeCanvas();
  }

  private update() {
    let lookingPrisoner = this.prisoners.find(
      (prisoner) => prisoner.status === "looking"
    );
    if (!lookingPrisoner) {
      this.boxes.forEach((box) => (box.isSeen = false));
      lookingPrisoner = this.prisoners.find(
        (prisoner) => prisoner.status === "prison"
      );
    }

    if (!lookingPrisoner) {
      return;
    }

    lookingPrisoner.status = "looking";

    const strategyFn = STRATEGY_FUNCTIONS[this.strategy.value];

    const prevBox =
      lookingPrisoner.seenBoxes[lookingPrisoner.seenBoxes.length - 1];

    if (prevBox) {
      if (prevBox.number === lookingPrisoner.id) {
        lookingPrisoner.status = "free";
        return;
      }

      if (lookingPrisoner.seenBoxes.length >= this.prisoners.length / 2) {
        lookingPrisoner.status = "failed";
        return;
      }
    }

    const nextBox = strategyFn(this.boxes, lookingPrisoner);

    nextBox.isSeen = true;
    lookingPrisoner.seenBoxes.push(nextBox);
  }

  lastDraw = 0;

  private async animate() {
    if (this.isPaused || this.isCancelled) {
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
      (prisoner) => prisoner.status === "free"
    );
    const isFailed = this.prisoners.some(
      (prisoner) => prisoner.status === "failed"
    );

    if (isSuccessful || isFailed) {
      this.resultCallback(isSuccessful);
    } else if (this.isCancelled) {
      this.resultCallback(undefined);
    } else if (!this.isPaused) {
      if (this.tickMsRef.current == null) {
        return;
      }
      // Render with setTimeout, when the tick is greater than 0.
      // If the tick is 0, then render for the first 50 frames every 10th frame, then every 25th frame after.
      if (
        this.tickMsRef.current > 0 ||
        // The browser crashes if we use the Promise.resolve method too much, so we have to tune it down.
        this.tickCount %
          (this.prisoners.length < 10 ? 2 : this.prisoners.length * 3) ===
          0
      ) {
        setTimeout(() => this.animate(), this.tickMsRef.current);
      } else {
        // If tick is 0, Promise.resolve will run VERY fast, but it will prevent draws from rendering to the screen.
        Promise.resolve(1).then(() => this.animate());
      }
    }
  }

  public resume() {
    clearTimeout(this.timeoutId);
    this.isPaused = false;
    this.animate();
  }

  public pause() {
    clearTimeout(this.timeoutId);
    this.isPaused = true;
  }

  public cancel() {
    clearTimeout(this.timeoutId);
    this.isCancelled = true;

    clearCtx(this.prisonCtx);
    clearCtx(this.lookingCtx);
    clearCtx(this.freeCtx);
  }

  async run(): Promise<boolean | undefined> {
    return new Promise((resolve) => {
      this.resultCallback = resolve;
      this.animate();
    });
  }
}

export const runSimulation = (
  numPrisoners: number,
  strategy: Strategy,
  prisonCanvas: HTMLCanvasElement,
  lookingCanvas: HTMLCanvasElement,
  freeCanvas: HTMLCanvasElement,
  tickMsRef: RefObject<number>,
  showCyclesRef: RefObject<boolean>
): { result: Promise<boolean | null | undefined>; simulation: Simulation } => {
  const simulation = new Simulation(
    numPrisoners,
    strategy,
    prisonCanvas,
    lookingCanvas,
    freeCanvas,
    tickMsRef,
    showCyclesRef
  );
  return {
    result: simulation.run(),
    simulation,
  };
};
