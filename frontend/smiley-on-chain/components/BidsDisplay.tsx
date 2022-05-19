import { BigNumber, Contract, ethers } from "ethers";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ABI from "../ABI/SmileyAuction.json";
import { wrapTransactionWithToast } from "../toast";
import { useWallet } from "../wallet/WalletContext";
import { useAuctionEvents } from "./AuctionEventsContext";
import ConnectButton from "./ConnectButton";

const BidsDisplay: FC<{ smileyId: number; duration: number }> = ({
  smileyId,
  duration,
}) => {
  const [{ provider, address }] = useWallet();
  const [expire, setExpire] = useState(duration);
  const [bids, setBids] = useState<{ value: BigNumber; bidder: string }[]>([]);
  const [maxBid, setMaxBid] = useState(BigNumber.from(0));
  const [minInc, setMinInc] = useState(0);
  const [contract, setContract] = useState<Contract>();
  const [minPrice, setMinPrice] = useState(0);
  const [time, setTime] = useState(Date.now());
  const [{ events, selected }] = useAuctionEvents();

  const interval = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (interval.current) clearInterval(interval.current);
    if (selected === -1 || selected === events.length - 1)
      interval.current = setInterval(() => {
        setTime(Date.now());
      }, 1000);
  }, [smileyId]);

  useEffect(() => {
    if (!contract) return;

    const auctionFilter = contract.filters.AuctionExtended(smileyId);
    contract.removeAllListeners(auctionFilter);

    contract!.on(auctionFilter, (newTime) => {
      setExpire(newTime);
    });
  }, [bids]);

  useEffect(() => {
    if (time > expire * 1000) {
      if (interval.current) clearInterval(interval.current);
    }
  }, [time]);

  useEffect(() => {
    setContract(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_AUCTION_ADDRESS!,
        ABI,
        provider
      )
    );
  }, [provider]);

  useEffect(() => {
    if (!contract) return;

    const auctionFilter = contract!.filters.AuctionBid(smileyId);
    contract.removeAllListeners(auctionFilter);
    contract.queryFilter(auctionFilter).then((allEvents) => {
      setBids(
        allEvents.map((e) => ({
          bidder: e.args?.[1],
          value: e.args?.[2],
        }))
      );

      contract!.on(auctionFilter, (_, bidder, value, extend) => {
        if (
          bids.findIndex(
            (item) => item.value.toString() === value.toString()
          ) === -1
        )
          setBids([...bids, { bidder, value }]);
      });
    });
  }, [contract, smileyId]);

  useEffect(() => {
    if (!contract) return;
    const auctionFilter = contract!.filters.AuctionBid(smileyId);
    contract.removeAllListeners(auctionFilter);
    contract.on(auctionFilter, (_, bidder, value, extend) => {
      if (
        bids.findIndex((item) => item.value.toString() === value.toString()) ===
        -1
      )
        setBids([...bids, { bidder, value }]);
    });
  }, [bids]);

  const fetchMinInc = useCallback(async () => {
    const minPrice = await contract?.minimumPrice();
    setMinPrice(minPrice?.toNumber() ?? 0 / 1e18);
    const minIncrease = await contract?.minimumBidIncrease();
    setMinInc(minIncrease ?? 0);
  }, []);

  useEffect(() => {
    fetchMinInc();
  }, []);

  useEffect(() => {
    const idx = bids.length - 1;
    if (idx < 0) return;
    setMaxBid(bids[idx].value);
  }, [bids]);

  const min =
    maxBid.toBigInt() > 0
      ? maxBid.mul(BigNumber.from(100 + minInc)).div(100)
      : ethers.utils.parseEther(minPrice.toString());

  const [bidValue, setBidValue] = useState(min);

  return (
    <div className="flex items-start justify-center w-1/3">
      <div className="flex flex-col gap-y-2 max-w-max">
        {bids.length > 0
          ? bids
              .filter((val, idx, array) => {
                return (
                  -1 ===
                  array.findIndex(
                    (v, i) =>
                      i !== idx && v.value.toString() === val.value.toString()
                  )
                );
              })
              .map(
                (
                  { value, bidder }: { bidder: string; value: BigNumber },
                  index
                ) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl ${
                      index === bids.length - 1 ? "bg-lime-300" : "bg-white"
                    }`}
                  >
                    {bidder}: {ethers.utils.formatEther(value)}ETH
                  </div>
                )
              )
              .reverse()
          : (selected === -1 || selected === events.length - 1) && (
              <div>No bids... </div>
            )}
        {(selected === -1 || selected === events.length - 1) &&
        time < expire * 1000 ? (
          <>
            <input
              type="number"
              step={ethers.utils.formatEther(
                min
                  .mul(100 + minInc)
                  .div(100)
                  .sub(min)
              )}
              min={ethers.utils.formatEther(min)}
              value={ethers.utils.formatEther(bidValue)}
              onChange={(e) =>
                setBidValue(ethers.utils.parseEther(e.target.value))
              }
            />
            {address ? (
              <button
                className="py-2 text-lg font-bold bg-green-500 rounded-md"
                onClick={async () => {
                  const contract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_AUCTION_ADDRESS!,
                    ABI,
                    (provider as ethers.providers.Web3Provider)?.getSigner()
                  );

                  try {
                    const tx = await contract.bid(smileyId, {
                      value: bidValue,
                    });

                    await wrapTransactionWithToast(tx);
                  } catch (e: any) {
                    toast.error(e?.data?.message ?? "Error");
                  }
                }}
              >
                BID
              </button>
            ) : (
              <ConnectButton />
            )}
            {expire - Math.ceil(time / 1000)} seconds left
          </>
        ) : (
          <>
            {address ? (
              <>
                {" "}
                <button
                  className={`bg-lime-300 py-2 ${
                    selected === -1 || selected === events.length - 1
                      ? ""
                      : "hidden"
                  }`}
                  onClick={async () => {
                    const contract = new ethers.Contract(
                      process.env.NEXT_PUBLIC_AUCTION_ADDRESS!,
                      ABI,
                      (provider as ethers.providers.Web3Provider)?.getSigner()
                    );

                    const tx = await contract.completeAuctionAndStartNew();
                    await wrapTransactionWithToast(tx);
                    location.reload();
                  }}
                >
                  FINALIZE
                </button>
                <div
                  className={`w-full text-center  ${
                    selected === -1 || selected === events.length - 1
                      ? ""
                      : "hidden"
                  }`}
                >
                  FINALIZE AND GET 3 VOTING POINTS
                </div>
              </>
            ) : (
              <ConnectButton />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BidsDisplay;
