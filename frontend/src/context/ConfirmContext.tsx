import React, { createContext, useContext, useState, useCallback } from 'react';
import { LuxuryConfirmModal, ConfirmType } from '../components/ui/LuxuryConfirmModal';

export interface ConfirmOptions {
  type?: ConfirmType;
  title: string;
  description: string;
  details?: {
    invitationTitle?: string;
    tokenCost?: number;
    remainingTokens?: number;
    planName?: string;
  };
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((val: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', description: '' },
    resolve: null
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (modalState.resolve) modalState.resolve(false);
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [modalState]);

  const handleConfirm = useCallback(() => {
    if (modalState.resolve) modalState.resolve(true);
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [modalState]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <LuxuryConfirmModal
        isOpen={modalState.isOpen}
        type={modalState.options.type || 'general'}
        title={modalState.options.title}
        description={modalState.options.description}
        details={modalState.options.details}
        confirmLabel={modalState.options.confirmLabel}
        cancelLabel={modalState.options.cancelLabel}
        isDestructive={modalState.options.isDestructive}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return {
      confirm: async () => true
    };
  }
  return ctx;
};
