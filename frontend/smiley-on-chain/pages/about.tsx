import type { NextPage } from "next";

const DAOPage: NextPage = () => {
  return (
    <div className="flex items-center justify-center m-auto bg-blue-100">
      <div className="flex flex-col justify-start max-w-screen-lg bg-blue-100">
        <div className="p-2 text-5xl font-bold text-white ">
          Smilies On-Chain
        </div>
        <div className="p-2 text-2xl font-bold">How it works?</div>
        <div className="px-3">
          A smiley is minted every day and available on auction for next 24h
          Each smiley is stored completely on Ethereum blockckain (no IPFS or
          centralized servers).
        </div>
        <div className="p-2 text-2xl font-bold">DAO</div>
        <div className="px-3">
          The highest bidder will be avarded with the Smiley and some amount of
          the Smiley Voting Token which act as membership of Smiley DAO. 100% of
          auction profit goes to DAO and members can propose and vote on how
          that ETH will be spent. 3 Voting Tokens can be obtaiined by finalizing
          an auction (even if you didn{"'"}t take part in it!).
        </div>
        <div className="p-2 text-2xl font-bold">Smiley Attributes</div>
        <div className="px-3">
          Smilies have 6 different attributes which are randomly selcted when a
          Smiley is minted. Background: 15 Eye: 15 Face: 15 Hat: 2 Moustache: 5
          Mouth: 15 So more that 500K possible Smilies {":)"}
        </div>
      </div>
    </div>
  );
};

export default DAOPage;
