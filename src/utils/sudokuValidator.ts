type SudokuGrid = (number | null)[][];

export const isValidPlacement = (
  board: SudokuGrid,
  row: number,
  col: number,
  num: number | null
): boolean => {
  if (num === null) {
    return true; // Empty cells are always "valid" in terms of placement rules
  }

  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        (i + startRow !== row || j + startCol !== col) &&
        board[i + startRow][j + startCol] === num
      ) {
        return false;
      }
    }
  }

  return true;
};

export const isBoardValid = (board: SudokuGrid): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const num = board[r][c];
      if (num !== null && !isValidPlacement(board, r, c, num)) {
        return false;
      }
    }
  }
  return true;
};
