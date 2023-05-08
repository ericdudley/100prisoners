import { useState } from "react";
import { Strategy } from "../models";
import cx from "classnames";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export default function StrategyView({
  strategy,
}: {
  strategy: Strategy | undefined | null;
}): React.ReactElement | null {
  if (!strategy) {
    return null;
  }
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cx(
        "mx-auto my-4 flex flex-col gap-1 max-w-lg border border-gray-300 rounded-md p-4 pb-12 transition-all duration-300 ease-in-out overflow-hidden relative cursor-pointer",
        isExpanded ? "h-auto" : "h-24"
      )}
      onClick={() => {
        setIsExpanded((prevIsExpanded) => !prevIsExpanded);
      }}
    >
      <h1 className="text-xl">{strategy.label} Strategy</h1>
      <p>{strategy.description}</p>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center h-8 bg-gradient-to-t from-gray-300 to-[#ffffff11]">
        {isExpanded ? <FaArrowUp /> : <FaArrowDown />}
      </div>
    </div>
  );
}
