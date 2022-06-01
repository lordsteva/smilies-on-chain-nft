import { ethers } from "ethers";
import React, { createContext, useContext, useReducer } from "react";
import { WalletAction } from "./actions";
import reducer from "./reducers";

export const initialState: WalletState = {
  balance: "-1",
  address: undefined,
  wallet: { name: "" },
  network: process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? 4 : 1337,
  provider: new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_NODE_URL,
    {
      chainId: process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? 4 : 1337,

      name: process.env.NEXT_PUBLIC_NETWORK ?? "localhost",
    }
  ),
};

type WalletState = {
  balance: string;
  address?: string;
  wallet: { name: string };
  network: number;
  provider?: ethers.providers.Provider;
};

const WalletContext = createContext<
  [WalletState, React.Dispatch<WalletAction>]
>([initialState, () => null]);
const useWallet = () => useContext(WalletContext);
const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <WalletContext.Provider value={[state, dispatch]}>
      {children}
    </WalletContext.Provider>
  );
};

export type { WalletState };
export { WalletProvider, useWallet };
