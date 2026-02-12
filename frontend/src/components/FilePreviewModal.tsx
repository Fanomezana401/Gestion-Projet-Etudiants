import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen) return null;

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.webp'].some(ext =>
    fileUrl.toLowerCase().endsWith(ext)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
              {isPdf ? (
                <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <ImageIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate tracking-tight">
              {fileName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white shadow-md"
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Aperçu non disponible
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ce type de fichier ne peut pas être prévisualisé.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;