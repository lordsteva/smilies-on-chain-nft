import Link from "next/link";
import { FC } from "react";
import ConnectButton from "./ConnectButton";

const Navbar: FC<{}> = () => {
  return (
    <div className="flex justify-center w-full bg-blue-400">
      <div className="flex items-center justify-between w-full max-w-screen-xl p-4">
        <div className="flex gap-x-1">
          <Link href="/">
            <button className="px-3 py-2 font-bold text-white bg-blue-600 hover:bg-blue-300">
              Home
            </button>
          </Link>
          <Link href="/dao">
            <button className="px-3 py-2 font-bold text-white bg-green-600 hover:bg-green-400">
              DAO
            </button>
          </Link>
          <Link href="/about">
            <button className="px-3 py-2 font-bold text-white bg-green-600 hover:bg-green-400">
              About
            </button>
          </Link>
        </div>

        <ConnectButton />
      </div>
    </div>
  );
};

export default Navbar;
