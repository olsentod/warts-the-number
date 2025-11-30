import React from 'react';

interface NumberPadProps {
  onNumberClick: (number: number) => void;
  selectedNumber: number | null;
  board: (number | null)[][];
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, selectedNumber, board }) => {
  const getRemainingCount = (num: number) => {
    let count = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === num) count++;
      });
    });
    return 9 - count;
  };

  return (
    <div className="number-pad">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((number) => {
        const remaining = getRemainingCount(number);
        return (
          <div key={number} className="number-pad-item">
            <button
              onClick={() => onNumberClick(number)}
              className={`${selectedNumber === number ? 'selected' : ''} ${remaining === 0 ? 'completed' : ''}`}
              disabled={remaining === 0}
            >
              {number}
            </button>
            <span className="count">{remaining}</span>
          </div>
        );
      })}
    </div>
  );
};

export default NumberPad;
