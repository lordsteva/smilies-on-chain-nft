import { ethers } from "ethers";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import ABI from "../ABI/SmileyNFT.json";
import { useAuctionEvents } from "../components/AuctionEventsContext";
import SmileyDisplay from "../components/SmileyDisplay";
import { useWallet } from "../wallet/WalletContext";

const Home: NextPage = () => {
  const [{ provider, address }, dispatch] = useWallet();
  const [smileyData, setSmileyData] = useState("");
  const [display, setDisplay] = useState(-1);

  const [{ events, selected, loading }, , setSelected, setLoading] =
    useAuctionEvents();
  const fetchSmiley = useCallback(
    async (display: number) => {
      const contract = new ethers.Contract(
        "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        ABI,
        provider
      );
      setLoading(true);
      const data = await contract.tokenURI(events[display].smileyId);
      setSmileyData(data);
      setLoading(false);
    },
    [events, provider]
  );

  useEffect(() => {
    if (!events || events.length === 0) {
      return;
    }
    const display = selected === -1 ? events.length - 1 : selected;
    setDisplay(display);
    fetchSmiley(display);
  }, [events, selected]);

  return (
    <div className="flex flex-col items-center justify-center bg-blue-100">
      <div className="flex items-center py-1">
        <div className="flex items-center gap-x-2">
          <button
            className={`text-white bg-blue-900 px-3 py-2 rounded-lg ${
              !loading && display > 0 ? "" : "invisible"
            }`}
            onClick={() => setSelected(display - 1)}
          >
            Previous
          </button>
          <div className="text-lg text-bold">
            On-chain NFT smiley #{display + 1}
          </div>
          <button
            className={`px-3 py-2  text-white bg-blue-900 rounded-lg ${
              !loading && display != -1 && display < events.length - 1
                ? ""
                : "invisible"
            }`}
            onClick={() => setSelected(display + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {smileyData ? (
        <SmileyDisplay
          duration={events[display].endTime.toNumber()}
          base64Data={smileyData}
          smileyId={events[display].smileyId.toNumber()}
        />
      ) : (
        "Loading...."
      )}
    </div>
  );
};

export default Home;
