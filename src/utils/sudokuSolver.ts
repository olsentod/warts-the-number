type SudokuGrid = (number | null)[][];

export const isValid = (grid: SudokuGrid, row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) {
      return false;
    }
  }

  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) {
      return false;
    }
  }

  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
};

export const solve = (grid: SudokuGrid): SudokuGrid | null => {
  const solvedGrid = grid.map(row => [...row]);
  if (solveHelper(solvedGrid)) {
    return solvedGrid;
  }
  return null;
};

const solveHelper = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveHelper(grid)) {
              return true;
            }
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};
