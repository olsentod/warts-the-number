import React from 'react';

interface NumberPadProps {
  onNumberClick: (number: number) => void;
  selectedNumber: number | null;
  board: (number | null)[][];
  isNoteMode: boolean;
  onToggleNoteMode: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, selectedNumber, board, isNoteMode, onToggleNoteMode }) => {
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
      <button
        className={`notation-btn ${isNoteMode ? 'active' : ''}`}
        onClick={onToggleNoteMode}
        title={isNoteMode ? "Turn Notes OFF" : "Turn Notes ON"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span className="label">Note</span>
        <span className="status">{isNoteMode ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
};

export default NumberPad;
