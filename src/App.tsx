import { useState, useEffect } from 'react';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import SavedGames from './components/SavedGames';
import { generateSudoku } from './utils/sudokuGenerator';
import { solve, isValid } from './utils/sudokuSolver';
import { useToast } from './context/ToastContext';
import './theme.css';
import './App.css';

type SudokuGrid = (number | null)[][];
type NotesGrid = number[][][];

interface SavedGame {
  id: string;
  date: string;
  difficulty: string;
  board: SudokuGrid;
  initialBoard: SudokuGrid;
  solution: SudokuGrid;
  isSolved: boolean;
  notes?: NotesGrid;
  timer?: number;
}

function App() {
  const [initialBoard, setInitialBoard] = useState<SudokuGrid>([]);
  const [board, setBoard] = useState<SudokuGrid>([]);
  const [solution, setSolution] = useState<SudokuGrid>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [notes, setNotes] = useState<NotesGrid>([]);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shakingCell, setShakingCell] = useState<{ row: number, col: number } | null>(null);

  const [highlightedCells, setHighlightedCells] = useState<{ row: number, col: number }[] | null>(null);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [clickedCell, setClickedCell] = useState<{ row: number, col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<string>('Tadpole');
  const [showSavedGames, setShowSavedGames] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isSolved && !isPaused && board.length > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSolved, isPaused, board.length]);

  const startNewGame = (diff: string = difficulty) => {
    const { puzzle, solution } = generateSudoku(diff);
    setInitialBoard(puzzle);
    setBoard(puzzle);
    setSolution(solution);
    setIsSolved(false);
    setIsPaused(false);
    setSelectedNumber(null);
    setHighlightedNumber(null);
    // Initialize empty notes grid
    const emptyNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));
    setNotes(emptyNotes);
    setMistakes(0);
    setTimer(0);
  };

  const solveSudoku = () => {
    const solvedBoard = solve(board);
    if (solvedBoard) {
      setBoard(solvedBoard);
      setIsSolved(true);
    }
  };

  const clearBoard = () => {
    setBoard(initialBoard);
    setIsSolved(false);
    setIsPaused(false);
    const emptyNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));
    setNotes(emptyNotes);
    setMistakes(0);
    setTimer(0);
  };

  const checkSolution = () => {
    if (JSON.stringify(board) === JSON.stringify(solution)) {
      showToast('Congratulations! You solved the puzzle correctly.', 'success');
      setIsSolved(true);
    } else {
      showToast('The solution is not correct. Keep trying!', 'error');
    }
  };

  const saveGame = () => {
    const game: SavedGame = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      difficulty,
      board,
      initialBoard,
      solution,
      isSolved,
      notes,
      timer,
    };
    const savedGames = JSON.parse(localStorage.getItem('sudokuSavedGames') || '[]');
    savedGames.push(game);
    localStorage.setItem('sudokuSavedGames', JSON.stringify(savedGames));
    showToast('Game saved successfully!', 'success');
    setIsPaused(true);
  };

  const loadGame = (game: SavedGame) => {
    setInitialBoard(game.initialBoard);
    setBoard(game.board);
    setSolution(game.solution);
    setDifficulty(game.difficulty);
    setIsSolved(game.isSolved);
    setIsPaused(false);
    setNotes(game.notes || Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])));
    setTimer(game.timer || 0);
    setShowSavedGames(false);
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] === null) {
      if (selectedNumber !== null && !isSolved) {
        if (isNoteMode) {
          // Toggle note
          const newNotes = [...notes];
          const cellNotes = [...newNotes[row][col]];
          const noteIndex = cellNotes.indexOf(selectedNumber);

          if (noteIndex === -1) {
            // Check if the number is valid in this position
            if (isValid(board, row, col, selectedNumber)) {
              cellNotes.push(selectedNumber);
              cellNotes.sort((a, b) => a - b);
            }
          } else {
            cellNotes.splice(noteIndex, 1);
          }

          newNotes[row][col] = cellNotes;
          setNotes(newNotes);
        } else {
          // Normal number placement
          if (initialBoard[row][col] === null) {
            // Check if the move is correct
            if (solution[row][col] === selectedNumber) {
              const newBoard = board.map((r, rIdx) =>
                r.map((c, cIdx) => (rIdx === row && cIdx === col ? selectedNumber : c))
              );
              setBoard(newBoard);

              // Remove notes for this number in the same row, col, and block
              // Also clear all notes in the placed cell
              const newNotes = notes.map((r, rIdx) =>
                r.map((c, cIdx) => {
                  if (rIdx === row && cIdx === col) {
                    return [];
                  }

                  const isSameRow = rIdx === row;
                  const isSameCol = cIdx === col;
                  const isSameBlock = Math.floor(rIdx / 3) === Math.floor(row / 3) && Math.floor(cIdx / 3) === Math.floor(col / 3);

                  if (isSameRow || isSameCol || isSameBlock) {
                    return c.filter(n => n !== selectedNumber);
                  }
                  return c;
                })
              );
              setNotes(newNotes);

              // Check if the selected number is now fully placed (count == 9)
              let count = 0;
              newBoard.forEach(r => r.forEach(c => {
                if (c === selectedNumber) count++;
              }));
              if (count === 9) {
                setSelectedNumber(null);
              }
            } else {
              // Incorrect move
              setMistakes(prev => prev + 1);
              setShakingCell({ row, col });

              // Temporarily show the wrong number
              const newBoard = board.map((r, rIdx) =>
                r.map((c, cIdx) => (rIdx === row && cIdx === col ? selectedNumber : c))
              );
              setBoard(newBoard);

              // Revert after animation
              setTimeout(() => {
                const revertedBoard = newBoard.map((r, rIdx) =>
                  r.map((c, cIdx) => (rIdx === row && cIdx === col ? null : c))
                );
                setBoard(revertedBoard);
                setShakingCell(null);
              }, 500);
            }
          }
        }
      }

      // Highlight logic remains the same
      const newHighlightedCells = [];
      for (let i = 0; i < 9; i++) {
        newHighlightedCells.push({ row, col: i });
        newHighlightedCells.push({ row: i, col });
      }
      // Highlight 3x3 square
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          newHighlightedCells.push({ row: startRow + r, col: startCol + c });
        }
      }
      setHighlightedCells(newHighlightedCells);
      setHighlightedNumber(selectedNumber);
      setClickedCell({ row, col });
    } else {
      // Existing logic for clicking filled cells
      const newHighlightedCells = [];
      for (let i = 0; i < 9; i++) {
        newHighlightedCells.push({ row, col: i });
        newHighlightedCells.push({ row: i, col });
      }
      // Highlight 3x3 square
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          newHighlightedCells.push({ row: startRow + r, col: startCol + c });
        }
      }
      setHighlightedCells(newHighlightedCells);
      setHighlightedNumber(board[row][col]);
      setClickedCell({ row, col });
    }
  };

  const handleNumberSelect = (number: number) => {
    if (selectedNumber === number) {
      setSelectedNumber(null);
      setHighlightedNumber(null);
    } else {
      setSelectedNumber(number);
      setHighlightedNumber(number);
      setHighlightedCells(null);
      setClickedCell(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startNewGame();
  }, []);



  return (
    <div className="app-container">
      <div className="main-card">
        <div className="header-container">
          <div className="header-top">
            <h1>Wart's the Number?</h1>
            <div className="header-controls">
              <button
                className={`btn-icon ${isNoteMode ? 'active' : ''}`}
                onClick={() => setIsNoteMode(!isNoteMode)}
                title={isNoteMode ? "Turn Notes OFF" : "Turn Notes ON"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="header-stats">
            <div className="timer">
              {formatTime(timer)}
            </div>
            <div className="mistake-counter">
              Mistakes: {mistakes}
            </div>
          </div>

          {isMenuOpen && (
            <div className="menu-dropdown">
              <div className="menu-section">
                <h3>Difficulty</h3>
                <div className="difficulty-selector">
                  {['Tadpole', 'Hopper', 'Bullfrog', 'Toad King'].map((level) => (
                    <button
                      key={level}
                      className={`btn-secondary ${difficulty === level ? 'active' : ''}`}
                      onClick={() => {
                        setDifficulty(level);
                        startNewGame(level);
                        setIsMenuOpen(false);
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="menu-section">
                <h3>Game Controls</h3>
                <div className="menu-actions">
                  <button className="btn-primary" onClick={() => { startNewGame(difficulty); setIsMenuOpen(false); }}>New Game</button>
                  <button className="btn-secondary" onClick={() => { setIsPaused(true); setIsMenuOpen(false); }}>Pause</button>
                  <button className="btn-secondary" onClick={() => { solveSudoku(); setIsMenuOpen(false); }}>Solve</button>
                  <button className="btn-secondary" onClick={() => { clearBoard(); setIsMenuOpen(false); }}>Reset</button>
                  <button className="btn-secondary" onClick={() => { checkSolution(); setIsMenuOpen(false); }}>Check</button>
                  <button className="btn-secondary" onClick={() => { saveGame(); setIsMenuOpen(false); }}>Save</button>
                  <button className="btn-secondary" onClick={() => { setShowSavedGames(true); setIsMenuOpen(false); }}>Load</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {board.length > 0 ? (
          <div className="sudoku-board-container">
            {isPaused && (
              <div className="resume-overlay">
                <button className="resume-btn" onClick={() => setIsPaused(false)}>
                  Resume
                </button>
              </div>
            )}
            <div className={isPaused ? 'paused' : ''}>
              <SudokuBoard
                initialBoard={initialBoard}
                board={board}
                isSolved={isSolved}
                onCellClick={handleCellClick}
                highlightedCells={highlightedCells}
                highlightedNumber={highlightedNumber}
                clickedCell={clickedCell}
                notes={notes}
                shakingCell={shakingCell}
              />
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}

        {isSolved && <p className="success-message">Puzzle solved!</p>}

        <NumberPad
          onNumberClick={handleNumberSelect}
          selectedNumber={selectedNumber}
          board={board}
        />

        {showSavedGames && (
          <SavedGames
            onLoadGame={loadGame}
            onClose={() => setShowSavedGames(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
