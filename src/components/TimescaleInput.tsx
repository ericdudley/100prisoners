import React from "react";

export default function TimescaleInput({
  value,
  valueLabel,
  onChange,
  className,
}: {
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
  className?: string;
}): React.ReactElement {
  return (
    <div className={className}>
      <label htmlFor="timescale" className="text-sm font-medium text-gray-700">
        Simulation tick: {valueLabel}ms
      </label>
      <input
        id="timescale"
        type="range"
        min="0"
        max="1000"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full mt-2"
      />
      <p className="text-gray-600 text-xs">
        Try changing the simulation speed as it's running. When set to 0, the
        simulation will skip most drawing to the screen but run much faster.
      </p>
    </div>
  );
}
