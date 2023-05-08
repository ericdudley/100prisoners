import cx from "classnames";
import React, { useState } from "react";
import { FaPause, FaPlay, FaStepForward } from "react-icons/fa";
import { MAX_PRISONERS } from "../constants";
import { Strategy } from "../models";
import { STRATEGY_OPTIONS } from "../strategies";
import StrategyView from "./StrategyView";

export default function Settings({
  onPause,
  onReset,
  onResume,
  onStart,
  onStep,
  className,
}: {
  onStart: (strategy: Strategy, prisonerCount: number) => void;
  onResume: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  className?: string;
}): React.ReactElement {
  const [prisonerCount, setPrisonerCount] = useState(100);
  const [strategy, setStrategy] = useState<Strategy>(STRATEGY_OPTIONS[0]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const error =
    prisonerCount < 1 || prisonerCount > MAX_PRISONERS
      ? "Number of prisoners must be between 1 and 1000"
      : false;

  const onClickStartPauseButton = async () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      onPause();
    } else if (isRunning && isPaused) {
      setIsPaused(false);
      onResume();
    } else {
      setIsRunning(true);
      onStart(strategy, prisonerCount);
    }
  };

  const onClickResetButton = () => {
    setIsPaused(false);
    setIsRunning(false);
    onReset();
  };

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <StrategyView strategy={strategy} />
      <div className="flex items-center gap-4 mt-8 flex-wrap">
        <div className="flex flex-col relative w-32">
          <label
            htmlFor="numPrisoners"
            className="inline-block w-32 text-sm font-medium text-gray-700 absolute top-[-20px]"
          >
            Prisoner Count
          </label>
          <input
            id="numPrisoners"
            type="number"
            min="1"
            max={MAX_PRISONERS}
            defaultValue={prisonerCount}
            onChange={(e) => {
              setPrisonerCount(Number(e.target.value));
            }}
            className={cx("border-2  p-2 rounded-lg", {
              "border-red-500": error,
              "border-gray-300": !error,
            })}
            disabled={isRunning}
          />
        </div>
        <div className="flex flex-col relative w-32">
          <label
            htmlFor="strategy"
            className="inline-block w-32 text-sm font-medium text-gray-700 absolute top-[-20px]"
          >
            Strategy
          </label>
          <select
            id="strategy"
            value={strategy.value}
            onChange={(e) => {
              const strategy = STRATEGY_OPTIONS.find(
                (s) => s.value === e.target.value
              );
              if (!strategy) {
                throw new Error("Invalid strategy");
              }
              setStrategy(strategy);
            }}
            className="border-2 border-gray-300 p-2 rounded-lg"
            disabled={isRunning}
          >
            {STRATEGY_OPTIONS.map((option) => (
              <option value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={onClickStartPauseButton}
            className={cx(
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2",
              !error && (!isRunning || isPaused) && "animate-pulse",
              isPaused && "bg-yellow-500 hover:bg-yellow-700",
              error && "bg-gray-400 hover:bg-gray-600 border-2 border-red-600"
            )}
            disabled={!!error && !isRunning}
          >
            {isPaused || !isRunning ? (
              <>
                <span>{isRunning ? "Resume" : "Start"}</span>
                <FaPlay />
              </>
            ) : (
              <>
                <span>Pause</span>
                <FaPause />
              </>
            )}
          </button>
          {isRunning && (
            <>
              <button
                onClick={() => {
                  if (!isPaused) {
                    setIsPaused(true);
                    onPause();
                  }
                  onStep();
                }}
                className={cx(
                  "rounded py-2 px-4 flex gap-2 items-center",
                  "bg-blue-500 hover:bg-blue-700 text-white"
                )}
                disabled={!isRunning}
              >
                <span>Step</span>
                <FaStepForward />
              </button>

              <button
                onClick={onClickResetButton}
                className="bg-red-400 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
      <p
        className={cx("text-xs", {
          "text-gray-600": !error,
          "text-red-600": error,
        })}
      >
        {error
          ? error
          : isRunning
          ? "Simulation is running, click reset to change these settings."
          : "Click start to run the simulation with these settings."}
      </p>
    </div>
  );
}
