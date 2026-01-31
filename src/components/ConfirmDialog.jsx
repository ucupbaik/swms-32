import React from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  title = 'Konfirmasi',
  message = 'Yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-gray-100">{cancelText}</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}
