import { generateSudoku } from '../utils/sudokuGenerator';
import { isValid } from '../utils/sudokuSolver';

export type SudokuGrid = (number | null)[][];
export type NotesGrid = number[][][];

export interface GameState {
    gameId: string;
    date: string;
    difficulty: string;
    initialBoard: SudokuGrid;
    board: SudokuGrid;
    solution: SudokuGrid;
    isSolved: boolean;
    notes: NotesGrid;
    mistakes: number;
    timer: number;
    isPaused: boolean;
    selectedNumber: number | null;
    isNoteMode: boolean;
    highlightedNumber: number | null;
    shakingCell: { row: number, col: number, value: number } | null;
    completedAnimationCells: { row: number, col: number, delay: number }[];
    highlightedCells: { row: number, col: number }[] | null;
    clickedCell: { row: number, col: number } | null;
}

export type Action =
    | { type: 'NEW_GAME'; payload: { difficulty: string } }
    | { type: 'LOAD_GAME'; payload: Partial<GameState> }
    | { type: 'CELL_CLICK'; payload: { row: number; col: number } }
    | { type: 'NUMBER_SELECT'; payload: number }
    | { type: 'TOGGLE_NOTE_MODE' }
    | { type: 'PAUSE_GAME' }
    | { type: 'RESUME_GAME' }
    | { type: 'TICK_TIMER' }
    | { type: 'CLEAR_ANIMATION' }
    | { type: 'CLEAR_SHAKE' };

export const initialState: GameState = {
    gameId: '',
    date: '',
    difficulty: 'Tadpole',
    initialBoard: [],
    board: [],
    solution: [],
    isSolved: false,
    notes: [],
    mistakes: 0,
    timer: 0,
    isPaused: false,
    selectedNumber: null,
    isNoteMode: false,
    highlightedNumber: null,
    shakingCell: null,
    completedAnimationCells: [],
    highlightedCells: null,
    clickedCell: null,
};

export const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'NEW_GAME': {
            const { difficulty } = action.payload;
            const { puzzle, solution } = generateSudoku(difficulty);
            const emptyNotes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));

            return {
                ...initialState,
                gameId: crypto.randomUUID(),
                date: new Date().toISOString(),
                difficulty,
                initialBoard: puzzle,
                board: puzzle,
                solution,
                notes: emptyNotes,
            };
        }

        case 'LOAD_GAME': {
            return {
                ...state,
                ...action.payload,
                isPaused: false,
                highlightedCells: null,
                clickedCell: null,
                shakingCell: null,
                completedAnimationCells: [],
            };
        }

        case 'TICK_TIMER': {
            if (state.isSolved || state.isPaused) return state;
            return {
                ...state,
                timer: state.timer + 1,
            };
        }

        case 'PAUSE_GAME':
            return { ...state, isPaused: true };

        case 'RESUME_GAME':
            return { ...state, isPaused: false };

        case 'TOGGLE_NOTE_MODE':
            return { ...state, isNoteMode: !state.isNoteMode };

        case 'NUMBER_SELECT': {
            const number = action.payload;
            if (state.selectedNumber === number) {
                return {
                    ...state,
                    selectedNumber: null,
                    highlightedNumber: null,
                    highlightedCells: null,
                    clickedCell: null,
                };
            }
            return {
                ...state,
                selectedNumber: number,
                highlightedNumber: number,
                highlightedCells: null,
                clickedCell: null,
            };
        }

        case 'CLEAR_ANIMATION':
            return { ...state, completedAnimationCells: [] };

        case 'CLEAR_SHAKE':
            return {
                ...state,
                shakingCell: null,
            };

        case 'CELL_CLICK': {
            const { row, col } = action.payload;

            // Always update highlighting logic first
            let newHighlightedCells: { row: number, col: number }[] = [];

            // Highlight row and col
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

            const baseUpdate = {
                ...state,
                highlightedCells: newHighlightedCells,
                clickedCell: { row, col },
                highlightedNumber: state.board[row][col] || state.selectedNumber,
            };

            // If cell is already filled, just update highlights (unless it's the temporary wrong number, but that's handled by disabled state usually)
            if (state.board[row][col] !== null) {
                return baseUpdate;
            }

            // If no number selected or game solved, just highlight
            if (state.selectedNumber === null || state.isSolved) {
                return baseUpdate;
            }

            // Attempt to place number
            if (state.isNoteMode) {
                const newNotes = [...state.notes];
                // Deep copy the row to avoid mutation
                newNotes[row] = [...newNotes[row]];
                const cellNotes = [...newNotes[row][col]];
                const noteIndex = cellNotes.indexOf(state.selectedNumber);

                if (noteIndex === -1) {
                    // Check validity for notes
                    if (isValid(state.board, row, col, state.selectedNumber)) {
                        cellNotes.push(state.selectedNumber);
                        cellNotes.sort((a, b) => a - b);
                    }
                } else {
                    cellNotes.splice(noteIndex, 1);
                }

                newNotes[row][col] = cellNotes;
                return {
                    ...baseUpdate,
                    notes: newNotes,
                };
            } else {
                // Normal placement
                if (state.initialBoard[row][col] !== null) return baseUpdate; // Should be covered by board check but safety first

                if (state.solution[row][col] === state.selectedNumber) {
                    // Correct move
                    const newBoard = state.board.map((r, rIdx) =>
                        r.map((c, cIdx) => (rIdx === row && cIdx === col ? state.selectedNumber : c))
                    );

                    // Update notes
                    const newNotes = state.notes.map((r, rIdx) =>
                        r.map((c, cIdx) => {
                            if (rIdx === row && cIdx === col) return [];

                            const isSameRow = rIdx === row;
                            const isSameCol = cIdx === col;
                            const isSameBlock = Math.floor(rIdx / 3) === Math.floor(row / 3) && Math.floor(cIdx / 3) === Math.floor(col / 3);

                            if (isSameRow || isSameCol || isSameBlock) {
                                return c.filter(n => n !== state.selectedNumber);
                            }
                            return c;
                        })
                    );

                    // Check for animations (row/col/square completion)
                    const completedCells: { row: number, col: number, delay: number }[] = [];
                    const delayPerDistance = 50;

                    // Helper to check completion
                    const checkCompletion = (type: 'row' | 'col' | 'square') => {
                        // ... logic from Game.tsx ...
                        // Since this is getting complex, let's simplify or copy the logic.
                        // We need to check if the *newBoard* has completed the row/col/square of the placed cell.

                        // Row
                        if (type === 'row') {
                            if (newBoard[row].every(cell => cell !== null)) {
                                for (let c = 0; c < 9; c++) {
                                    completedCells.push({ row, col: c, delay: Math.abs(c - col) * delayPerDistance });
                                }
                            }
                        }
                        // Col
                        if (type === 'col') {
                            let colComplete = true;
                            for (let r = 0; r < 9; r++) if (newBoard[r][col] === null) colComplete = false;
                            if (colComplete) {
                                for (let r = 0; r < 9; r++) {
                                    completedCells.push({ row: r, col, delay: Math.abs(r - row) * delayPerDistance });
                                }
                            }
                        }
                        // Square
                        if (type === 'square') {
                            const sr = Math.floor(row / 3) * 3;
                            const sc = Math.floor(col / 3) * 3;
                            let sqComplete = true;
                            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (newBoard[sr + r][sc + c] === null) sqComplete = false;
                            if (sqComplete) {
                                for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
                                    const dist = Math.abs((sr + r) - row) + Math.abs((sc + c) - col);
                                    completedCells.push({ row: sr + r, col: sc + c, delay: dist * delayPerDistance });
                                }
                            }
                        }
                    };

                    checkCompletion('row');
                    checkCompletion('col');
                    checkCompletion('square');

                    // Check if number is fully placed
                    let count = 0;
                    newBoard.forEach(r => r.forEach(c => { if (c === state.selectedNumber) count++; }));
                    const newSelectedNumber = count === 9 ? null : state.selectedNumber;

                    // Check win
                    let isSolved = true;
                    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (newBoard[r][c] !== state.solution[r][c]) isSolved = false;

                    return {
                        ...baseUpdate,
                        board: newBoard,
                        notes: newNotes,
                        completedAnimationCells: completedCells,
                        selectedNumber: newSelectedNumber,
                        isSolved,
                        highlightedNumber: newSelectedNumber, // Update highlight if number deselected
                    };

                } else {
                    // Incorrect move
                    // Temporarily set the board to show the wrong number
                    // UPDATE: Do NOT modify the board. Just set the shaking cell with the wrong value.
                    return {
                        ...baseUpdate,
                        mistakes: state.mistakes + 1,
                        shakingCell: { row, col, value: state.selectedNumber! },
                    };
                }
            }
        }

        default:
            return state;
    }
};
