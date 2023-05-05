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
    } else {
      setSimulationResult({ success: 0, failure: 0, total: 0 });
      setRunning(true);
    }
  };

  return (
    <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">
          The Prisoner's Problem
        </h1>
        <div className="flex items-center space-x-4">
          <input
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
        <div className="mt-4">
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
