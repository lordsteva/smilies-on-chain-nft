import { FC } from "react";
import ConnectButton from "./ConnectButton";

const ConnectWallet: FC<{}> = () => {
  return (
    <div className="flex items-center min-h-screen bg-gradient-to-r from-neutral-200 to-blue-400">
      <div className="flex items-center justify-center w-full text-lg text-white max-h-min gap-x-2">
        Please <ConnectButton /> to proceed
      </div>
    </div>
  );
};

export default ConnectWallet;
