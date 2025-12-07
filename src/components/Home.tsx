import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [hasSavedGame, setHasSavedGame] = useState(false);

    useEffect(() => {
        const savedGames = JSON.parse(localStorage.getItem('sudokuSavedGames') || '[]');
        setHasSavedGame(savedGames.length > 0);
    }, []);

    const handleStartGame = (difficulty: string) => {
        navigate('/game', { state: { mode: 'new', difficulty } });
    };

    const handleContinueGame = () => {
        navigate('/game', { state: { mode: 'resume' } });
    };

    const difficulties = [
        { id: 'Tadpole', label: 'Tadpole', description: 'Easy - Perfect for beginners' },
        { id: 'Hopper', label: 'Hopper', description: 'Medium - A nice challenge' },
        { id: 'Bullfrog', label: 'Bullfrog', description: 'Hard - For experienced players' },
        { id: 'Toad King', label: 'Toad King', description: 'Expert - Only for the masters' },
    ];

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">Wart's the Number?</h1>
                <p className="home-subtitle">Hop into a game of Sudoku!</p>

                {hasSavedGame && (
                    <div className="continue-section">
                        <button className="btn-primary continue-btn" onClick={handleContinueGame}>
                            Continue Last Game
                        </button>
                    </div>
                )}

                <div className="game-modes-grid">
                    {difficulties.map((diff) => (
                        <button
                            key={diff.id}
                            className="game-mode-card"
                            onClick={() => handleStartGame(diff.id)}
                        >
                            <h3>{diff.label}</h3>
                            <p>{diff.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
