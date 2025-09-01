import React, { createContext, useContext, useState } from "react";
import LoginModal from "../components/auth/LoginModal";
import SignupModal from "../components/auth/SignupModal";

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const value = {
    showLogin,
    showSignup,
    openLogin,
    openSignup,
    closeModals,
    switchToSignup,
    switchToLogin,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Render modals at the root level */}
      <LoginModal
        isOpen={showLogin}
        onClose={closeModals}
        onSwitchToSignup={switchToSignup}
      />
      <SignupModal
        isOpen={showSignup}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </ModalContext.Provider>
  );
};
