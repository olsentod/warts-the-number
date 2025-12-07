import { useEffect, useRef, useReducer, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';
import SavedGames from './SavedGames';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../context/ToastContext';
import { gameReducer, initialState, type GameState, type SudokuGrid, type NotesGrid } from '../reducers/gameReducer';

// Interface for what we actually save to localStorage
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
    mistakes?: number;
}

const Game = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Local UI state that doesn't need to be in the reducer
    const [showSavedGames, setShowSavedGames] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);

    // Ref to hold current game state for auto-saving
    const gameStateRef = useRef<GameState | null>(null);

    // Update ref whenever state changes
    useEffect(() => {
        gameStateRef.current = state;
    }, [state]);

    // Initialize game based on navigation state
    useEffect(() => {
        const navState = location.state as { mode?: 'new' | 'resume', difficulty?: string } | null;

        if (navState?.mode === 'resume') {
            const savedGames = JSON.parse(localStorage.getItem('sudokuSavedGames') || '[]');
            if (savedGames.length > 0) {
                // Sort by date to get the most recent one
                savedGames.sort((a: SavedGame, b: SavedGame) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const lastGame = savedGames[savedGames.length - 1];
                if (lastGame && lastGame.board && lastGame.board.length > 0) {
                    dispatch({ type: 'LOAD_GAME', payload: lastGame });
                } else {
                    dispatch({ type: 'NEW_GAME', payload: { difficulty: 'Tadpole' } });
                }
            } else {
                dispatch({ type: 'NEW_GAME', payload: { difficulty: 'Tadpole' } });
            }
        } else {
            const diff = navState?.difficulty || 'Tadpole';
            dispatch({ type: 'NEW_GAME', payload: { difficulty: diff } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (!state.isSolved && !state.isPaused && state.board.length > 0) {
            interval = setInterval(() => {
                dispatch({ type: 'TICK_TIMER' });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.isSolved, state.isPaused, state.board.length]);

    // Confetti
    useEffect(() => {
        if (state.isSolved) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
            showToast('Congratulations! You solved the puzzle correctly.', 'success');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isSolved]);

    // Clear animations
    useEffect(() => {
        if (state.completedAnimationCells.length > 0) {
            const timer = setTimeout(() => {
                dispatch({ type: 'CLEAR_ANIMATION' });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.completedAnimationCells]);

    // Clear shake
    useEffect(() => {
        if (state.shakingCell) {
            const timer = setTimeout(() => {
                dispatch({ type: 'CLEAR_SHAKE' });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [state.shakingCell]);

    // Auto-save
    const saveGame = (isAutoSave = false, dataOverride?: GameState) => {
        const currentData = dataOverride || state;

        // Don't save if the board is empty or invalid
        if (!currentData.board || currentData.board.length === 0) {
            return;
        }

        const gameData: SavedGame = {
            id: currentData.gameId,
            date: new Date().toISOString(),
            difficulty: currentData.difficulty,
            board: currentData.board,
            initialBoard: currentData.initialBoard,
            solution: currentData.solution,
            isSolved: currentData.isSolved,
            notes: currentData.notes,
            timer: currentData.timer,
            mistakes: currentData.mistakes,
        };

        const savedGames = JSON.parse(localStorage.getItem('sudokuSavedGames') || '[]');
        const existingIndex = savedGames.findIndex((g: SavedGame) => g.id === gameData.id);

        if (existingIndex >= 0) {
            savedGames[existingIndex] = gameData;
        } else {
            savedGames.push(gameData);
        }

        localStorage.setItem('sudokuSavedGames', JSON.stringify(savedGames));

        if (!isAutoSave) {
            showToast('Game saved successfully!', 'success');
            dispatch({ type: 'PAUSE_GAME' });
        }
    };

    // Auto-save on unmount
    useEffect(() => {
        return () => {
            if (gameStateRef.current && !gameStateRef.current.isSolved) {
                saveGame(true, gameStateRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-save on browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (gameStateRef.current && !gameStateRef.current.isSolved) {
                saveGame(true, gameStateRef.current);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-save whenever the game state changes (board, notes, mistakes)
    useEffect(() => {
        if (state.board.length > 0 && !state.isSolved) {
            saveGame(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.board, state.notes, state.isSolved, state.mistakes]);


    const handleLoadGame = (game: SavedGame) => {
        if (!game.board || game.board.length === 0) {
            showToast('Failed to load game: Invalid data', 'error');
            return;
        }
        dispatch({ type: 'LOAD_GAME', payload: game });
        setShowSavedGames(false);
    };

    const handleCellClick = (row: number, col: number) => {
        dispatch({ type: 'CELL_CLICK', payload: { row, col } });
    };

    const handleNumberSelect = (number: number) => {
        dispatch({ type: 'NUMBER_SELECT', payload: number });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleBackClick = () => {
        setShowExitConfirmation(true);
    };

    const handleConfirmExit = () => {
        setShowExitConfirmation(false);
        navigate('/');
    };

    return (
        <div className="game-wrapper">
            <div className="game-header">
                <button className="back-button" onClick={handleBackClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span className="back-text">Back</span>
                </button>
                <h1 className="game-title">Wart's the Number?</h1>
            </div>
            <div className="main-card">
                <div className="header-container">
                    <div className="header-top">
                        <div className="header-stats">
                            <div className="timer">
                                {formatTime(state.timer)}
                            </div>
                            <div className="mistake-counter">
                                Mistakes: {state.mistakes}
                            </div>
                        </div>
                        <div className="header-controls">

                            <button
                                className="btn-icon"
                                onClick={() => dispatch({ type: 'PAUSE_GAME' })}
                                title="Pause Game"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => saveGame()}
                                title="Save Game"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => setShowSavedGames(true)}
                                title="Load Game"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {state.board.length > 0 ? (
                    <div className="sudoku-board-container">
                        {state.isPaused && (
                            <div className="resume-overlay">
                                <button className="resume-btn" onClick={() => dispatch({ type: 'RESUME_GAME' })}>
                                    Resume
                                </button>
                            </div>
                        )}
                        <div className={state.isPaused ? 'paused' : ''}>
                            <SudokuBoard
                                initialBoard={state.initialBoard}
                                board={state.board}
                                isSolved={state.isSolved}
                                onCellClick={handleCellClick}
                                highlightedCells={state.highlightedCells}
                                highlightedNumber={state.highlightedNumber}
                                clickedCell={state.clickedCell}
                                notes={state.notes}
                                shakingCell={state.shakingCell}
                                completedAnimationCells={state.completedAnimationCells}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="sudoku-board-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--board-border)' }}>
                        <div style={{ color: 'var(--text-primary)' }}>Loading...</div>
                    </div>
                )}

                <NumberPad
                    onNumberClick={handleNumberSelect}
                    selectedNumber={state.selectedNumber}
                    board={state.board}
                    isNoteMode={state.isNoteMode}
                    onToggleNoteMode={() => dispatch({ type: 'TOGGLE_NOTE_MODE' })}
                />

                {showSavedGames && (
                    <SavedGames
                        onLoadGame={handleLoadGame}
                        onClose={() => setShowSavedGames(false)}
                    />
                )}
            </div>
            <ConfirmationModal
                isOpen={showExitConfirmation}
                title="Leave Game?"
                message="Are you sure you want to leave? Your progress is automatically saved."
                onConfirm={handleConfirmExit}
                onCancel={() => setShowExitConfirmation(false)}
            />
        </div >
    );
};

export default Game;
