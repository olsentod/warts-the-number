import { getSudoku } from 'sudoku-gen';

type SudokuGrid = (number | null)[][];
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const generateSudoku = (difficulty: string = 'easy'): { puzzle: SudokuGrid, solution: SudokuGrid } => {
  // Map UI difficulty to library difficulty
  const diffMap: { [key: string]: Difficulty } = {
    'tadpole': 'easy',
    'hopper': 'medium',
    'bullfrog': 'hard',
    'toad king': 'expert',
    'easy': 'easy',
    'medium': 'medium',
    'hard': 'hard',
    'pro': 'expert',
    'expert': 'expert'
  };

  const mappedDifficulty = diffMap[difficulty.toLowerCase()] || 'easy';

  const sudoku = getSudoku(mappedDifficulty);

  const puzzle: SudokuGrid = [];
  const solution: SudokuGrid = [];

  // Convert 81-char string to 9x9 grid
  for (let i = 0; i < 9; i++) {
    const puzzleRow: (number | null)[] = [];
    const solutionRow: (number | null)[] = [];

    for (let j = 0; j < 9; j++) {
      const charIndex = i * 9 + j;

      // Parse puzzle
      const puzzleChar = sudoku.puzzle[charIndex];
      puzzleRow.push(puzzleChar === '-' ? null : parseInt(puzzleChar));

      // Parse solution
      const solutionChar = sudoku.solution[charIndex];
      solutionRow.push(parseInt(solutionChar));
    }

    puzzle.push(puzzleRow);
    solution.push(solutionRow);
  }

  return { puzzle, solution };
};
