import { useMemo } from "react";
import { getIdenticonCells } from "../utils/identicon";

function Identicon({ seed, size = 20 }) {
  const cells = useMemo(() => getIdenticonCells(seed), [seed]);

  return (
    <svg width={size} height={size} viewBox="0 0 5 5" aria-hidden="true">
      {cells.map((cell) => (
        <rect
          key={`${cell.col}-${cell.row}`}
          x={cell.col}
          y={cell.row}
          width={1}
          height={1}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export default Identicon;
