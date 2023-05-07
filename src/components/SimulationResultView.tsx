import React from "react";
import { SimulationResult } from "../models";
import Stat from "./Stat";

export default function SimulationResultView({
  simulationResult,
  className,
}: {
  simulationResult: SimulationResult;
  className?: string;
}): React.ReactElement {
  return (
    <div className={className}>
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
  );
}
