import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h2>{title}</h2>
                <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>{message}</p>
                <div className="game-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
