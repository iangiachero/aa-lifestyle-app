import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [openCount, setOpenCount] = useState(0);

  const openModal = useCallback(() => {
    setOpenCount(c => c + 1);
  }, []);

  const closeModal = useCallback(() => {
    setOpenCount(c => Math.max(0, c - 1));
  }, []);

  return (
    <ModalContext.Provider value={{ isAnyModalOpen: openCount > 0, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
