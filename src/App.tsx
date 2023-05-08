import React, { useRef, useState } from "react";
import "./App.css";
import { Simulation, runSimulation } from "./Simulation";
import Canvas from "./components/Canvas";
import Settings from "./components/Settings";
import SimulationResultView from "./components/SimulationResultView";
import TimescaleInput from "./components/TimescaleInput";
import { SimulationResult } from "./models";
import StrategyView from "./components/StrategyView";
import Footer from "./components/Footer";

const App: React.FC = () => {
  const [simulationResult, setSimulationResult] = useState<SimulationResult>({
    success: 0,
    failure: 0,
    total: 0,
  });
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);

  const prisonCanvasRef = useRef<HTMLCanvasElement>(null);
  const lookingCanvasRef = useRef<HTMLCanvasElement>(null);
  const freeCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation | null>();

  const [timescale, setTimescale] = useState(1);
  const timescaleRef = useRef(timescale);
  const flooredTimescale = Math.floor(timescale);
  const transformedTimescale =
    flooredTimescale > 0 && flooredTimescale < 10 ? 1 : flooredTimescale;
  timescaleRef.current = transformedTimescale;

  const [showCycles, setShowCycles] = useState(false);
  const showCyclesRef = useRef(showCycles);
  showCyclesRef.current = showCycles;

  return (
    <div className="App min-h-screen w-full bg-gray-100 flex flex-col items-center pt-8">
      <div className="bg-white p-6 shadow-lg max-w-6xl">
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
        <SimulationResultView
          simulationResult={simulationResult}
          className="mt-4"
        />
        <Settings
          className="mt-4"
          onStart={async (strategy, prisonerCount) => {
            setSimulationResult({ success: 0, failure: 0, total: 0 });
            isRunningRef.current = true;
            isPausedRef.current = false;

            while (isRunningRef.current) {
              const { result, simulation } = runSimulation(
                prisonerCount,
                strategy,
                prisonCanvasRef.current!,
                lookingCanvasRef.current!,
                freeCanvasRef.current!,
                timescaleRef,
                showCyclesRef
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
          }}
          onPause={() => {
            isPausedRef.current = true;
            simulationRef.current?.pause();
          }}
          onResume={() => {
            isPausedRef.current = false;
            simulationRef.current?.resume();
          }}
          onStep={() => {
            simulationRef.current?.step();
          }}
          onReset={() => {
            isRunningRef.current = false;
            isPausedRef.current = false;
            simulationRef.current?.cancel();
            simulationRef.current = null;
          }}
        />
        <TimescaleInput
          value={timescale}
          onChange={(value) => {
            setTimescale(value);
          }}
          valueLabel={`${transformedTimescale}`}
        />
        <div className="flex flex-col gap-2">
          <div className="mt-4 flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id="show-cycles"
              checked={showCycles}
              onChange={(e) => {
                setShowCycles(e.target.checked);
                showCyclesRef.current = e.target.checked;

                if (simulationRef.current != null) {
                  simulationRef.current.draw();
                }
              }}
            />
            <label htmlFor="show-cycles">Show cycles</label>
          </div>
          <p className="text-gray-700 text-sm">
            Draw the drawers grouped by cycles. If prisoners use the Optimal
            strategy, they will only fail if there is a cycle longer than the
            number of drawers they are allowed to search.
          </p>
        </div>
        <div className="mt-4 w-full mx-auto flex flex-row gap-2 justify-evenly flex-wrap">
          <Canvas title="Prison" canvasRef={prisonCanvasRef} />
          <Canvas title="Cupboard" canvasRef={lookingCanvasRef} />
          <Canvas title="Freedom" canvasRef={freeCanvasRef} />
        </div>
      </div>
      <Footer className="flex-1 min-h-[4rem]" />
    </div>
  );
};

export default App;
