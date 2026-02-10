import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface FieldHelpProps {
  fieldKey: string;
  helpContent: {
    title: string;
    description: string;
    examples?: string[];
    tips?: string[];
  };
}

export function FieldHelp({ fieldKey, helpContent }: FieldHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const modalContent = isOpen && mounted ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {helpContent.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              {helpContent.description}
            </p>
          </div>

          {/* Examples */}
          {helpContent.examples && helpContent.examples.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                📝 Exemples :
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                {helpContent.examples.map((example, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    • {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {helpContent.tips && helpContent.tips.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                💡 Conseils :
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                {helpContent.tips.map((tip, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    • {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <Button
            type="button"
            onClick={handleClose}
            className="w-full"
          >
            Compris
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Help Icon Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        aria-label="Aide"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Render modal in portal at body level */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
