import React, { useMemo } from 'react';
import { isValidPlacement } from '../utils/sudokuValidator';

// Define types for better readability and type checking
type SudokuGrid = (number | null)[][];

interface CellProps {
  value: number | null;
  isInvalid: boolean;
  isSolved: boolean;
  isHighlighted: boolean;
  isHighlightedNumber: boolean;
  isClicked: boolean;
  onClick: () => void;
  notes?: number[];
  highlightedNumberValue: number | null;
  isShaking: boolean;
  isBubbling: boolean;
  animationDelay: number;
}

const Cell: React.FC<CellProps> = React.memo(({
  value,
  isInvalid,
  isSolved,
  isHighlighted,
  isHighlightedNumber,
  isClicked,
  onClick,
  notes,
  highlightedNumberValue,
  isShaking,
  isBubbling,
  animationDelay
}) => {
  const cellClasses = [
    'cell',
    value === null ? 'empty' : '',
    isInvalid ? 'invalid' : '',
    isHighlighted ? 'highlighted' : '',
    isHighlightedNumber ? 'highlighted-number' : '',
    isClicked ? 'clicked' : '',
    isShaking ? 'shake' : '',
    isBubbling ? 'bubble' : '',
  ].join(' ');

  return (
    <button
      onClick={onClick}
      className={cellClasses}
      disabled={isSolved}
      style={{ animationDelay: isBubbling ? `${animationDelay}ms` : '0ms' }}
    >
      {value !== null ? (
        value
      ) : (
        <div className="cell-notes-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div key={num} className={`note-number ${notes?.includes(num) && num === highlightedNumberValue ? 'highlighted-note' : ''}`}>
              {notes?.includes(num) ? num : ''}
            </div>
          ))}
        </div>
      )}
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for performance optimization
  return (
    prevProps.value === nextProps.value &&
    prevProps.isInvalid === nextProps.isInvalid &&
    prevProps.isSolved === nextProps.isSolved &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isHighlightedNumber === nextProps.isHighlightedNumber &&
    prevProps.isClicked === nextProps.isClicked &&
    prevProps.isShaking === nextProps.isShaking &&
    prevProps.isBubbling === nextProps.isBubbling &&
    prevProps.highlightedNumberValue === nextProps.highlightedNumberValue &&
    // Deep compare notes only if they might have changed
    JSON.stringify(prevProps.notes) === JSON.stringify(nextProps.notes)
  );
});

interface SudokuBoardProps {
  initialBoard: SudokuGrid;
  board: SudokuGrid;
  isSolved: boolean;
  onCellClick: (row: number, col: number) => void;
  highlightedCells: { row: number, col: number }[] | null;
  highlightedNumber: number | null;
  clickedCell: { row: number, col: number } | null;
  notes: number[][][];
  shakingCell: { row: number, col: number, value: number } | null;
  completedAnimationCells: { row: number, col: number, delay: number }[];
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  isSolved,
  onCellClick,
  highlightedCells,
  highlightedNumber,
  clickedCell,
  notes,
  shakingCell,
  completedAnimationCells
}) => {

  const invalidCells = useMemo(() => {
    const newInvalidCells: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== null && !isValidPlacement(board, r, c, board[r][c])) {
          newInvalidCells[r][c] = true;
        }
      }
    }
    return newInvalidCells;
  }, [board]);

  return (
    <div className="sudoku-board">
      {board.flat().map((cellValue, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;

        // Optimize lookup for highlighted cells
        // This is still O(N) where N is highlighted cells, but usually small (20ish)
        // Could be optimized further with a Set or 2D boolean array if needed, but likely fine for now.
        const isHighlighted = highlightedCells?.some(cell => cell.row === row && cell.col === col) ?? false;
        const isHighlightedNumber = highlightedNumber !== null && cellValue === highlightedNumber;
        const isClicked = clickedCell?.row === row && clickedCell?.col === col;
        const isShaking = shakingCell?.row === row && shakingCell?.col === col;

        const animationCell = completedAnimationCells.find(cell => cell.row === row && cell.col === col);
        const isBubbling = !!animationCell;
        const animationDelay = animationCell ? animationCell.delay : 0;

        return (
          <Cell
            key={index}
            value={isShaking && shakingCell?.value ? shakingCell.value : cellValue}
            isInvalid={invalidCells[row][col] || isShaking}
            isSolved={isSolved}
            isHighlighted={isHighlighted}
            isHighlightedNumber={isHighlightedNumber}
            isClicked={isClicked}
            onClick={() => onCellClick(row, col)}
            notes={notes && notes[row] ? notes[row][col] : []}
            highlightedNumberValue={highlightedNumber}
            isShaking={isShaking}
            isBubbling={isBubbling}
            animationDelay={animationDelay}
          />
        );
      })}
    </div>
  );
};

export default React.memo(SudokuBoard);
