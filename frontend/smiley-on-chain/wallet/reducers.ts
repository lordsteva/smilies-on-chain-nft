import type { WalletAction } from "./actions";
import { initialState, WalletState } from "./WalletContext";

export default function walletReducer(
  state: WalletState,
  action: WalletAction
): WalletState {
  switch (action.type) {
    case "SET_ADDRESS":
      return { ...state, ...{ address: action.payload } };
    case "SET_NETWORK":
      return { ...state, ...{ network: action.payload } };
    case "SET_BALANCE":
      return { ...state, ...{ balance: action.payload } };
    case "SET_WALLET":
      return { ...state, ...{ wallet: action.payload } };
    case "SET_PROVIDER":
      return { ...state, ...{ provider: action.payload } };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
