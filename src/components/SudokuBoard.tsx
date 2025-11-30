import { useState, useEffect } from 'react';
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
}

const Cell: React.FC<CellProps> = ({ value, isInvalid, isSolved, isHighlighted, isHighlightedNumber, isClicked, onClick, notes, highlightedNumberValue, isShaking }) => {
  const cellClasses = [
    'cell',
    value === null ? 'empty' : '',
    isInvalid ? 'invalid' : '',
    isHighlighted ? 'highlighted' : '',
    isHighlightedNumber ? 'highlighted-number' : '',
    isClicked ? 'clicked' : '',
    isShaking ? 'shake' : '',
  ].join(' ');

  return (
    <button
      onClick={onClick}
      className={cellClasses}
      disabled={isSolved}
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
};

interface SudokuBoardProps {
  initialBoard: SudokuGrid;
  board: SudokuGrid;
  isSolved: boolean;
  onCellClick: (row: number, col: number) => void;
  highlightedCells: { row: number, col: number }[] | null;
  highlightedNumber: number | null;
  clickedCell: { row: number, col: number } | null;
  notes: number[][][];
  shakingCell: { row: number, col: number } | null;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({ board, isSolved, onCellClick, highlightedCells, highlightedNumber, clickedCell, notes, shakingCell }) => {
  const [invalidCells, setInvalidCells] = useState<boolean[][]>(
    Array(9).fill(null).map(() => Array(9).fill(false))
  );

  useEffect(() => {
    // Re-validate the board whenever it changes
    const newInvalidCells: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== null && !isValidPlacement(board, r, c, board[r][c])) {
          newInvalidCells[r][c] = true;
        }
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvalidCells(newInvalidCells);
  }, [board]);

  return (
    <div className="sudoku-board">
      {board.flat().map((cellValue, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;

        const isHighlighted = highlightedCells?.some(cell => cell.row === row && cell.col === col) ?? false;
        const isHighlightedNumber = highlightedNumber !== null && cellValue === highlightedNumber;
        const isClicked = clickedCell?.row === row && clickedCell?.col === col;
        const isShaking = shakingCell?.row === row && shakingCell?.col === col;
        return (
          <Cell
            key={index}
            value={cellValue}
            isInvalid={invalidCells[row][col]}
            isSolved={isSolved}
            isHighlighted={isHighlighted}
            isHighlightedNumber={isHighlightedNumber}
            isClicked={isClicked}
            onClick={() => onCellClick(row, col)}
            notes={notes ? notes[row][col] : []}
            highlightedNumberValue={highlightedNumber}
            isShaking={isShaking}
          />
        );
      })}
    </div>
  );
};

export default SudokuBoard;
