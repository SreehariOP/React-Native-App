import React, { createContext, useState, useCallback } from 'react';

const WarningContext = createContext({
  shownWarnings: {},
  showWarning: (id) => {},
});

export const WarningProvider = ({ children }) => {
  const [shownWarnings, setShownWarnings] = useState({});

  const showWarning = useCallback((id) => {
    setShownWarnings((prev) => ({ ...prev, [id]: true }));
  }, []);

  return (
    <WarningContext.Provider value={{ shownWarnings, showWarning }}>
      {children}
    </WarningContext.Provider>
  );
};

export default WarningContext;
