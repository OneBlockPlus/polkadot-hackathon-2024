// components/AlertDialog.tsx
import React from "react";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#1C1A11] border border-[#373737] p-6 rounded-md shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-[#F6E18B]">{title}</h2>
        <p className="mt-2 text-gray-300">{description}</p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#373737] text-white rounded hover:bg-[#444444]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#F6E18B] text-black rounded hover:bg-[#dcc87d]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
