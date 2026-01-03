import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  forceCollapse: () => void;
  restorePrevious: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsedState] = useState(false);
  const [previousState, setPreviousState] = useState(false);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => !prev);
  }, []);

  const forceCollapse = useCallback(() => {
    setPreviousState(collapsed);
    setCollapsedState(true);
  }, [collapsed]);

  const restorePrevious = useCallback(() => {
    setCollapsedState(previousState);
  }, [previousState]);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggleCollapsed,
        forceCollapse,
        restorePrevious,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
