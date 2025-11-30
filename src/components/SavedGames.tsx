import React from 'react';

interface SavedGame {
    id: string;
    date: string;
    difficulty: string;
    board: (number | null)[][];
    initialBoard: (number | null)[][];
    solution: (number | null)[][];
    isSolved: boolean;
    notes?: number[][][];
    timer?: number;
}

interface SavedGamesProps {
    onLoadGame: (game: SavedGame) => void;
    onClose: () => void;
}

const SavedGames: React.FC<SavedGamesProps> = ({ onLoadGame, onClose }) => {
    const [savedGames, setSavedGames] = React.useState<SavedGame[]>([]);

    React.useEffect(() => {
        const games = JSON.parse(localStorage.getItem('sudokuSavedGames') || '[]');
        setSavedGames(games);
    }, []);

    const handleDelete = (id: string) => {
        const updatedGames = savedGames.filter((game) => game.id !== id);
        setSavedGames(updatedGames);
        localStorage.setItem('sudokuSavedGames', JSON.stringify(updatedGames));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Saved Games</h2>
                {savedGames.length === 0 ? (
                    <p>No saved games found.</p>
                ) : (
                    <ul className="saved-games-list">
                        {savedGames.map((game) => (
                            <li key={game.id} className="saved-game-item">
                                <div className="game-info">
                                    <span className="game-date">{new Date(game.date).toLocaleString()}</span>
                                    <span className="game-difficulty">{game.difficulty}</span>
                                </div>
                                <div className="game-actions">
                                    <button className="btn-secondary" onClick={() => onLoadGame(game)}>
                                        Load
                                    </button>
                                    <button className="btn-danger" onClick={() => handleDelete(game.id)}>
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <button className="btn-primary" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default SavedGames;
