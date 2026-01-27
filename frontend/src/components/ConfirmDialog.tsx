import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div className="py-2">
                {isDestructive && (
                    <div className="flex items-center gap-3 mb-4 text-error-600 bg-error-50 p-3 rounded-lg">
                        <AlertTriangle size={24} />
                        <span className="font-medium">Warning: Destructive Action</span>
                    </div>
                )}
                <p className="text-secondary leading-relaxed">{message}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
