'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { TELEGRAM_LINK } from '@/lib/constants';

interface TelegramConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function TelegramConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Перейти в Telegram?',
  description = 'Мы откроем Telegram, чтобы забронировать место.',
  confirmLabel = 'Открыть Telegram',
  cancelLabel = 'Отмена',
}: TelegramConfirmModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
      return;
    }
    window.open(TELEGRAM_LINK, '_blank');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-5">
        <p className="text-sm text-text-secondary mb-5">{description}</p>
        <div className="flex gap-3">
          <Button
            fullWidth
            onClick={handleConfirm}
            className="bg-[#27A7E7] hover:bg-[#1f96d6] text-white"
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" fullWidth onClick={onClose} aria-label={cancelLabel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
