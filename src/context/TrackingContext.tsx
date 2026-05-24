import React, {
  createContext,
  useContext,
  useState,
} from "react";

interface TrackingContextType {
  isTracking: boolean;

  setIsTracking:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
}

const TrackingContext =
  createContext<
    TrackingContextType
    | null
  >(null);

export function TrackingProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {

  const [
    isTracking,
    setIsTracking,
  ] = useState(false);

  return (
    <TrackingContext.Provider
      value={{
        isTracking,
        setIsTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext() {

  const context =
    useContext(
      TrackingContext
    );

  if (!context) {
    throw new Error(
      "TrackingContext not found"
    );
  }

  return context;
}