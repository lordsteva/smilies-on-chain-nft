import { ethers } from "ethers";
import { FC, useCallback, useEffect, useState } from "react";
import NFT_ABI from "../ABI/SmileyNFT.json";
import { useWallet } from "../wallet/WalletContext";
import { useAuctionEvents } from "./AuctionEventsContext";
import BidsDisplay from "./BidsDisplay";

const SmileyDisplay: FC<{
  base64Data: string;
  duration: number;
  smileyId: number;
}> = ({ base64Data, duration, smileyId }) => {
  const [{ provider }] = useWallet();
  const [{ loading }, ,] = useAuctionEvents();
  const [attributes, setAttributes] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [points, setPoints] = useState(0);

  const fetchPoints = useCallback(async (smileyId: number) => {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_ADDRESS!,
      NFT_ABI,
      provider
    );
    const points = await contract.getPoints(smileyId);
    setPoints(points.toNumber());
  }, []);
  useEffect(() => {
    fetchPoints(smileyId);
  }, [smileyId, provider]);

  useEffect(() => {
    const data = Buffer.from(
      base64Data.replace("data:application/json;base64,", ""),
      "base64"
    ).toString("utf8");
    if (!data) return;

    const nftData = JSON.parse(data);
    setAttributes(nftData.attributes);
    const imageString = Buffer.from(
      nftData.image_data.replace("data:image/svg+xml;base64,", ""),
      "base64"
    ).toString("utf8");
    const blob = new Blob([imageString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
  }, [base64Data]);

  if (loading) return <div>LOADING.....</div>;

  return (
    <div className="flex flex-row flex-wrap-reverse justify-center w-full p-4 bg-blue-400 gap-x-2 gap-y-2">
      <div className="flex items-start justify-center w-1/3 gap-x-2">
        <div className="flex flex-col gap-y-2 max-w-max ">
          {attributes.map(
            ({ value, trait_type }: { trait_type: string; value: string }) => (
              <div key={trait_type} className="p-3 bg-white rounded-2xl">
                {trait_type}: {value}
              </div>
            )
          )}
          <div className="p-3 font-bold text-white bg-blue-300 rounded-2xl">
            Voting points: {points}
          </div>
        </div>
      </div>
      <img className="inline max-w-lg" src={imageUrl} />
      <BidsDisplay duration={duration} smileyId={smileyId} />
    </div>
  );
};

export default SmileyDisplay;
