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

function clearCtx(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

class Prisoner {
  id: number;
  seenNumbers: number[];
  status: "prison" | "looking" | "free" | "failed";

  constructor(id: number) {
    this.id = id;
    this.seenNumbers = [];
    this.status = "prison";
  }
}

export class Simulation {
  private prisonCanvas: HTMLCanvasElement;
  private prisonCtx: CanvasRenderingContext2D;
  private lookingCanvas: HTMLCanvasElement;
  private lookingCtx: CanvasRenderingContext2D;
  private freeCanvas: HTMLCanvasElement;
  private freeCtx: CanvasRenderingContext2D;

  private animationFrameId: number | null;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private tickMs: RefObject<number>;

  private prisoners: Prisoner[];
  private boxes: number[];
  public result: boolean | null = null;
  private tickCount: number = 0;

  constructor(
    numPrisoners: number,
    prisonCanvas: HTMLCanvasElement,
    lookingCanvas: HTMLCanvasElement,
    freeCanvas: HTMLCanvasElement,
    timescaleRef: RefObject<number>
  ) {
    this.prisonCanvas = prisonCanvas;
    this.prisonCtx = prisonCanvas.getContext("2d")!;
    this.lookingCanvas = lookingCanvas;
    this.lookingCtx = lookingCanvas.getContext("2d")!;
    this.freeCanvas = freeCanvas;
    this.freeCtx = freeCanvas.getContext("2d")!;

    this.animationFrameId = null;
    this.tickMs = timescaleRef;

    // Initialize prisoners with id equal to index
    this.prisoners = Array(numPrisoners)
      .fill(0)
      .map((_, idx) => new Prisoner(idx));

    // Initialize boxes and shuffle
    this.boxes = [...Array(numPrisoners).keys()];
    for (let i = this.boxes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.boxes[i], this.boxes[j]] = [this.boxes[j], this.boxes[i]];
    }
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
    this.boxes.forEach((boxNumber, index) => {
      const { row, col } = this.getGridPosition(index, gridSize);
      const x = col * boxWidth;
      const y = row * boxHeight;

      const lookingPrisoner = this.prisoners.find(
        (prisoner) => prisoner.status === "looking"
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

      this.lookingCtx.fillStyle = fillStyle;
      this.lookingCtx.strokeStyle = strokeStyle;
      this.lookingCtx.fillRect(x, y, boxWidth, boxHeight);
      this.lookingCtx.strokeRect(x, y, boxWidth, boxHeight);

      // Draw box number
      this.drawNumberInBox(
        this.lookingCtx,
        x,
        y,
        boxWidth,
        boxHeight,
        numberToDraw
      );
    });

    // Draw prisoners
    this.prisoners
      .filter((prisoner) => prisoner.status === "looking")
      .forEach((prisoner) => {
        const GHOST_LENGTH = 10;
        const drawPositions = prisoner.seenNumbers.slice(
          prisoner.seenNumbers.length >= GHOST_LENGTH
            ? prisoner.seenNumbers.length - GHOST_LENGTH
            : 0
        );

        drawPositions.forEach((boxIndex, seenIdx) => {
          // Render prisoner on top of the box
          const boxPosition = this.getGridPosition(boxIndex, gridSize);
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

  private draw() {
    this.drawPrisonCanvas();
    this.drawLookingCanvas();
    this.drawFreeCanvas();
  }

  private update() {
    let lookingPrisoner = this.prisoners.find(
      (prisoner) => prisoner.status === "looking"
    );
    if (!lookingPrisoner) {
      lookingPrisoner = this.prisoners.find(
        (prisoner) => prisoner.status === "prison"
      );
    }

    if (!lookingPrisoner) {
      return;
    }

    lookingPrisoner.status = "looking";

    let firstTick = false;
    if (lookingPrisoner.seenNumbers.length === 0) {
      lookingPrisoner.seenNumbers.push(lookingPrisoner.id);
      firstTick = true;
    }

    const lastSeenNumber =
      lookingPrisoner.seenNumbers[lookingPrisoner.seenNumbers.length - 1];

    const nextBoxesNumber = this.boxes[lastSeenNumber];

    if (nextBoxesNumber === lookingPrisoner.id) {
      lookingPrisoner.status = "free";
    } else if (
      lookingPrisoner.seenNumbers.length ===
      this.prisoners.length / 2
    ) {
      // Maximum allowed number of box openings reached
      lookingPrisoner.status = "failed";
    } else if (!firstTick) {
      lookingPrisoner.seenNumbers.push(nextBoxesNumber);
    }
  }

  lastDraw = 0;

  private async animate() {
    if (this.isPaused) {
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
      this.result = isSuccessful && !isFailed;
    } else if (!this.isPaused && !this.isCancelled) {
      if (this.tickMs.current == null) {
        return;
      }
      // Render with setTimeout, when the tick is greater than 0.
      // If the tick is 0, then render for the first 50 frames every 10th frame, then every 25th frame after.
      if (this.tickMs.current > 0 || this.tickCount % 100 === 0) {
        setTimeout(() => this.animate(), this.tickMs.current);
      } else {
        // If tick is 0, Promise.resolve will run VERY fast, but it will prevent draws from rendering to the screen.
        Promise.resolve(1).then(() => this.animate());
      }
    }
  }

  public resume() {
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
    }
    this.isPaused = false;
    this.animate();
  }

  public pause() {
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
    }
    this.isPaused = true;
  }

  public cancel() {
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
    }
    this.isCancelled = true;

    clearCtx(this.prisonCtx);
    clearCtx(this.lookingCtx);
    clearCtx(this.freeCtx);
  }

  async run(): Promise<boolean | undefined> {
    return new Promise((resolve) => {
      this.animate();

      // TODO: Implement the logic to decide the outcome of the simulation
      // For now, we just resolve the promise with a random outcome after 5 seconds
      const interval = setInterval(() => {
        if (this.result != null) {
          clearInterval(interval);
          resolve(this.result);
        } else if (this.isCancelled) {
          clearInterval(interval);
          resolve(undefined);
        }
      }, 100);
    });
  }
}

export const runSimulation = (
  numPrisoners: number,
  prisonCanvas: HTMLCanvasElement,
  lookingCanvas: HTMLCanvasElement,
  freeCanvas: HTMLCanvasElement,
  timescaleRef: RefObject<number>
): { result: Promise<boolean>; simulation: Simulation } => {
  const simulation = new Simulation(
    numPrisoners,
    prisonCanvas,
    lookingCanvas,
    freeCanvas,
    timescaleRef
  );
  return {
    result: simulation.run(),
    simulation,
  };
};
