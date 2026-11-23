import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

let openModalsCount = 0;

/**
 * Universal Modal Portal for Admin
 * - Renders children into `document.body` via React Portal.
 * - Locks background body scroll on open, unlocks when all modals close.
 * - Exact center alignment in visible viewport.
 * - Constrains modal height to `calc(100dvh - 32px)`.
 * - Handles ESC key and backdrop click.
 */
export default function ModalPortal({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  zIndex = 'z-[9999]',
  showBackdrop = true,
  closeOnEsc = true,
  closeOnBackdrop = true
}) {
  useEffect(() => {
    if (!isOpen) return;

    openModalsCount++;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      openModalsCount = Math.max(0, openModalsCount - 1);
      if (openModalsCount === 0) {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.touchAction = originalTouchAction || '';
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-4`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh'
      }}
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
          onClick={closeOnBackdrop ? onClose : undefined}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      )}

      {/* Centered Modal Container */}
      <div
        className={`relative z-10 w-full ${maxWidth} flex flex-col rounded-3xl border shadow-2xl transition-all duration-200 ${className}`}
        style={{
          maxHeight: 'min(calc(100dvh - 32px), calc(100vh - 32px))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
