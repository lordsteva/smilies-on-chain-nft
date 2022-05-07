import { ethers } from "ethers";
import { FC } from "react";
import { getOnboard } from "../wallet/Onboard";
import { useWallet } from "../wallet/WalletContext";

const ConnectButton: FC<{}> = () => {
  const [state, dispatch] = useWallet();
  const loggedIn = !!state.address;
  const balance = ethers.utils.formatEther(state?.balance ?? 0);

  return (
    <div className="flex justify-center">
      {loggedIn && (
        <div className="inline p-2 ml-1 bg-white rounded-md max-w-max">
          Address: {state.address}
        </div>
      )}
      {loggedIn && (
        <div className="inline p-2 ml-1 bg-white rounded-md max-w-max">
          Balance: ~{(+balance).toFixed(4)} ETH
        </div>
      )}
      {loggedIn && (
        <button
          className="p-2 ml-1 text-white bg-green-700 border border-green-900 rounded-md hover:bg-green-600"
          onClick={() => {
            const onboard = getOnboard(dispatch);
            onboard.walletSelect();
          }}
        >
          Change wallet
        </button>
      )}
      <button
        className={`ml-1 p-2 ${
          loggedIn ? "bg-red-700" : "bg-blue-700"
        } border ${
          loggedIn ? "border-red-900" : "border-blue-900"
        }  rounded-md text-white  ${
          loggedIn ? "hover:bg-red-600" : "hover:bg-blue-600"
        } hover:text-amber-50`}
        onClick={async () => {
          const onboard = getOnboard(dispatch);
          if (!loggedIn) {
            const success = await onboard.walletSelect();
            if (success) await onboard.walletCheck();
          } else {
            await onboard.walletReset();
            localStorage.removeItem("wallet");
          }
        }}
      >
        {loggedIn ? "Log Out" : "Connect Wallet"}
      </button>
    </div>
  );
};

export default ConnectButton;
