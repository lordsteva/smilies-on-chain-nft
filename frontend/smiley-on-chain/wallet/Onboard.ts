import Onboard from "bnc-onboard";
import { ethers } from "ethers";
import { WalletAction } from "./actions";

let onboard: ReturnType<typeof Onboard>;

const wallets = [
  { walletName: "coinbase", preferred: true },
  { walletName: "metamask", preferred: true },
  {
    walletName: "walletConnect",
    infuraKey: "a29f0338b6ac4815809d580624620c84",
  },
];

// initialize onboard
const initOnboard = (subscriptions: any) =>
  Onboard({
    hideBranding: true,
    darkMode: true,
    networkId: process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? 4 : 1337,
    subscriptions,
    walletSelect: { wallets },
    walletCheck: [
      { checkName: "connect" },
      { checkName: "network" },
      { checkName: "balance" },
    ],
  });

export function getOnboard(
  dispatch: React.Dispatch<WalletAction>
): ReturnType<typeof Onboard> {
  if (!onboard) {
    onboard = initOnboard({
      address: async (address: string) => {
        dispatch({
          type: "SET_ADDRESS",
          payload: address,
        });
      },
      network: (network: number) => {
        dispatch({
          type: "SET_NETWORK",
          payload: network,
        });
      },
      balance: (balance: string) => {
        dispatch({
          type: "SET_BALANCE",
          payload: balance,
        });
      },
      wallet: (wallet: any) => {
        if (wallet && wallet.name) {
          localStorage.setItem("wallet", wallet.name);
        }
        dispatch({
          type: "SET_PROVIDER",
          payload: wallet?.provider
            ? new ethers.providers.Web3Provider(wallet.provider)
            : new ethers.providers.JsonRpcProvider(
                process.env.NEXT_PUBLIC_NODE_URL,
                {
                  chainId:
                    process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? 4 : 1337,
                  name: process.env.NEXT_PUBLIC_NETWORK ?? "localhost",
                }
              ),
        });

        dispatch({
          type: "SET_WALLET",
          payload: wallet,
        });
      },
    } as Pick<Parameters<typeof Onboard>[0], "subscriptions">);
  }
  return onboard;
}
