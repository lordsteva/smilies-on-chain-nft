import { ethers } from "ethers";
import type { AppProps } from "next/app";
import { useCallback, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ABI from "../ABI/SmileyAuction.json";
import {
  AuctionEventsProvider,
  useAuctionEvents,
} from "../components/AuctionEventsContext";
import Navbar from "../components/Navbar";
import "../styles/globals.css";
import { getOnboard } from "../wallet/Onboard";
import { useWallet, WalletProvider } from "../wallet/WalletContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [{ address, provider }, dispatch] = useWallet();

  const [_, setEvetns] = useAuctionEvents();

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (!wallet) return;
    const onboard = getOnboard(dispatch);
    onboard.walletSelect(wallet).then((success) => {
      if (success) onboard.walletCheck();
    });
  }, []);

  const fetchAuctions = useCallback(async () => {
    const contract = new ethers.Contract(
      "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
      ABI,
      provider
    );
    const auctionFilter = contract.filters.AuctionCreated();
    const events = await contract.queryFilter(auctionFilter);
    setEvetns(
      events.map(({ args }) => ({
        smileyId: args!.smileyId,
        startTime: args!.startTime,
        endTime: args!.endTime,
      }))
    );
  }, [provider, setEvetns]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    fetchAuctions();
  }, [provider]);

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

function WalletWrapper(props: AppProps) {
  return (
    <AuctionEventsProvider>
      <WalletProvider>
        <MyApp {...props} />
      </WalletProvider>
      <ToastContainer />
    </AuctionEventsProvider>
  );
}

export default WalletWrapper;
