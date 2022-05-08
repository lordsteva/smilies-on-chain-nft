import { BigNumber } from "ethers";
import React, { createContext, useContext, useState } from "react";

type AuctionEventsContextState = {
  events: { smileyId: BigNumber; startTime: BigNumber; endTime: BigNumber }[];
  selected: number;
  loading: boolean;
};

const EventsContext = createContext<
  [
    AuctionEventsContextState,
    React.Dispatch<AuctionEventsContextState["events"]>,
    React.Dispatch<AuctionEventsContextState["selected"]>,
    React.Dispatch<AuctionEventsContextState["loading"]>
  ]
>([{ events: [], selected: -1, loading: false }, () => {}, () => {}, () => {}]);
const useAuctionEvents = () => useContext(EventsContext);
const AuctionEventsProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AuctionEventsContextState["events"]>([]);
  const [loading, setLoading] =
    useState<AuctionEventsContextState["loading"]>(false);
  const [selected, setSelected] =
    useState<AuctionEventsContextState["selected"]>(-1);
  return (
    <EventsContext.Provider
      value={[
        { events, selected, loading },
        setEvents,
        setSelected,
        setLoading,
      ]}
    >
      {children}
    </EventsContext.Provider>
  );
};

export type { AuctionEventsContextState };
export { AuctionEventsProvider, useAuctionEvents };
