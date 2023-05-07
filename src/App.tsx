import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { runSimulation, Simulation } from "./Simulation";

interface SimulationResult {
  success: number;
  failure: number;
  total: number;
}

interface StatProps {
  label: string;
  value: number | string;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <div className="text-sm font-medium text-gray-700">{label}:</div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

function Canvas({
  title,
  canvasRef,
}: {
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  return (
    <div>
      <h2 className="text-center text-3xl font-semibold text-gray-900 mb-4">
        {title}
      </h2>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300"
        width={300}
        height={300}
      />
    </div>
  );
}

const App: React.FC = () => {
  const [numPrisoners, setNumPrisoners] = useState(100);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>({
    success: 0,
    failure: 0,
    total: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);

  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(isRunning);

  const prisonCanvasRef = useRef<HTMLCanvasElement>(null);
  const lookingCanvasRef = useRef<HTMLCanvasElement>(null);
  const freeCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation | null>();

  const [timescale, setTimescale] = useState(1);
  const timescaleRef = useRef(timescale);

  useEffect(() => {
    timescaleRef.current = timescale > 0 && timescale < 10 ? 1 : timescale;
  }, [timescale]);

  const onClickStartPauseButton = async () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      isPausedRef.current = true;
      simulationRef.current?.pause();
    } else if (isRunning && isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      simulationRef.current?.resume();
    } else {
      setIsRunning(true);
      isRunningRef.current = true;

      while (isRunningRef.current) {
        const { result, simulation } = runSimulation(
          numPrisoners,
          prisonCanvasRef.current!,
          lookingCanvasRef.current!,
          freeCanvasRef.current!,
          timescaleRef
        );
        simulationRef.current = simulation;
        if (isPausedRef.current) {
          simulationRef.current.pause();
        }
        const success = await result;
        if (success != null) {
          setSimulationResult((prev) => {
            const updatedResult = {
              success: prev.success + (success ? 1 : 0),
              failure: prev.failure + (success ? 0 : 1),
              total: prev.total + 1,
            };

            return updatedResult;
          });
        }
      }
    }
  };

  const onClickResetButton = () => {
    setSimulationResult({ success: 0, failure: 0, total: 0 });
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
    simulationRef.current?.cancel();
  };

  return (
    <div className="App min-h-screen w-full bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl">
        <h1 className="text-center text-4xl font-semibold text-gray-900 mb-4">
          100 Prisoners Problem
        </h1>
        <p className="text-gray-700 text-base">
          A prison director offers 100 inmates, numbered 1-100, a chance at
          freedom. A room has a cupboard with 100 drawers, each containing one
          prisoner's number. Prisoners enter the room individually and can open
          50 drawers. If all prisoners find their numbers, they are granted
          freedom; if not, they return to prison. They can strategize beforehand
          but not communicate after the first prisoner enters. What is their
          optimal strategy?
        </p>
        <a
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          href="https://en.wikipedia.org/wiki/100_prisoners_problem"
          rel="noopener noreferrer"
          target="_blank"
        >
          Read more on Wikipedia
        </a>
        <div className="flex items-center space-x-4 mt-4">
          <label
            htmlFor="numPrisoners"
            className="text-sm font-medium text-gray-700"
          >
            Number of prisoners:
          </label>
          <input
            id="numPrisoners"
            type="number"
            min="1"
            max="200"
            value={numPrisoners}
            onChange={(e) => setNumPrisoners(parseInt(e.target.value))}
            className="w-24 border-2 border-gray-300 p-2 rounded-lg text-center"
          />
          <button
            onClick={onClickStartPauseButton}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isPaused || !isRunning ? "Start" : "Pause"}
          </button>
          <button
            onClick={onClickResetButton}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reset
          </button>
        </div>
        <div className="mt-4">
          <label
            htmlFor="timescale"
            className="text-sm font-medium text-gray-700"
          >
            Simulation tick (ms): {Math.round(timescaleRef.current)}
          </label>
          <input
            id="timescale"
            type="range"
            min="0"
            max="1000"
            value={timescale}
            onChange={(e) => setTimescale(parseInt(e.target.value))}
            className="w-full mt-2"
          />
          <p className="text-gray-600 text-xs">
            Try changing the simulation speed as it's running. When set to 0,
            the simulation will skip most drawing to the screen but run much
            faster.
          </p>
        </div>

        <div className="mt-4">
          <Stat
            label="Success (everyone finds number)"
            value={simulationResult.success}
          />
          <Stat
            label="Failure (one didn't find number)"
            value={simulationResult.failure}
          />
          <Stat label="Total" value={simulationResult.total} />
          <Stat
            label="Probability of success"
            value={`${
              simulationResult.total
                ? (
                    (simulationResult.success / simulationResult.total) *
                    100
                  ).toFixed(2)
                : 0
            }
          %`}
          />
        </div>
        <div className="mt-4 w-full mx-auto flex flex-row gap-2 justify-center flex-wrap">
          <Canvas title="Prison" canvasRef={prisonCanvasRef} />
          <Canvas title="Cupboard" canvasRef={lookingCanvasRef} />
          <Canvas title="Freedom" canvasRef={freeCanvasRef} />
        </div>
      </div>
    </div>
  );
};

export default App;
