import { FC } from "react";
import { useWallet } from "../wallet/WalletContext";
import ConnectButton from "./ConnectButton";

const Navbar: FC<{}> = () => {
  const [state, dispatch] = useWallet();

  return (
    <div className="w-full p-4 bg-blue-400">
      <ConnectButton />
    </div>
  );
};

export default Navbar;
