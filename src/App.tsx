import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { runSimulation } from "./Simulation";

interface SimulationResult {
  success: number;
  failure: number;
  total: number;
}

interface StatProps {
  label: string;
  value: number;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <div className="text-sm font-medium text-gray-700">{label}:</div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

const App: React.FC = () => {
  const [numPrisoners, setNumPrisoners] = useState(100);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>({
    success: 0,
    failure: 0,
    total: 0,
  });
  const [running, setRunning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelRef = useRef<() => void>();
  const [timescale, setTimescale] = useState(0);

  const timescaleRef = useRef(timescale);

  useEffect(() => {
    timescaleRef.current = timescale > 0 && timescale < 30 ? 1 : timescale;
  }, [timescale]);

  useEffect(() => {
    const runContinuousSimulation = async () => {
      while (running) {
        const { result, cancel } = runSimulation(
          numPrisoners,
          canvasRef.current!,
          timescaleRef
        );
        cancelRef.current = cancel;
        const success = await result;
        setSimulationResult((prev) => {
          const updatedResult = {
            success: prev.success + (success ? 1 : 0),
            failure: prev.failure + (success ? 0 : 1),
            total: prev.total + 1,
          };

          return updatedResult;
        });
      }
    };

    if (running) {
      runContinuousSimulation();
    }

    return () => {
      // TODO: Cancel the simulation if the user stops it
      // You will need to implement a cancellation mechanism in the Simulation class
      // and call it here
      if (cancelRef.current) {
        cancelRef.current();
      }
    };
  }, [running, numPrisoners]);

  const handleButtonClick = () => {
    if (running) {
      setRunning(false);
      cancelRef.current && cancelRef.current();
    } else {
      setRunning(true);
    }
  };

  const handleReset = () => {
    setSimulationResult({ success: 0, failure: 0, total: 0 });
    setRunning(false);
    cancelRef.current && cancelRef.current();
  };

  return (
    <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">
          100 Prisoner's Problem
        </h1>
        <p className="text-gray-700 text-base mb-4">
          The director of a prison offers 100 death row prisoners, who are
          numbered from 1 to 100, a last chance. A room contains a cupboard with
          100 drawers. The director randomly puts one prisoner's number in each
          closed drawer. The prisoners enter the room, one after another. Each
          prisoner may open and look into 50 drawers in any order. The drawers
          are closed again afterwards. If, during this search, every prisoner
          finds their number in one of the drawers, all prisoners are pardoned.
          If even one prisoner does not find their number, all prisoners die.
          Before the first prisoner enters the room, the prisoners may discuss
          strategy — but may not communicate once the first prisoner enters to
          look in the drawers. What is the prisoners' best strategy?
        </p>
        <div className="flex items-center space-x-4">
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
            max="100"
            value={numPrisoners}
            onChange={(e) => setNumPrisoners(parseInt(e.target.value))}
            className="w-24 border-2 border-gray-300 p-2 rounded-lg text-center"
          />
          <button
            onClick={handleButtonClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {running ? "Stop" : "Start"}
          </button>
          <button
            onClick={handleReset}
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
            Simulation tick:{" "}
            {timescale === 0
              ? "As fast as possible"
              : Math.round(timescaleRef.current)}
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
        </div>

        <div className="mt-4">
          <Stat label="Success" value={simulationResult.success} />
          <Stat label="Failure" value={simulationResult.failure} />
          <Stat label="Total" value={simulationResult.total} />
        </div>
        <div className="mt-4">
          Probability of success:{" "}
          {simulationResult.total
            ? (
                (simulationResult.success / simulationResult.total) *
                100
              ).toFixed(2)
            : 0}
          %
        </div>
        <div className="mt-4 mx-auto flex justify-center">
          <canvas
            ref={canvasRef}
            width={900}
            height={300}
            className="border-2 border-gray-300"
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
