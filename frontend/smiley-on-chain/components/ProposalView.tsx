import { ethers } from "ethers";
import { FC } from "react";
import ABI from "../ABI/SmileyGovernor.json";
import { useWallet } from "../wallet/WalletContext";

const ProposalState = [
  "Pending",
  "Active",
  "Canceled",
  "Defeated",
  "Succeeded",
  "Queued",
  "Expired",
  "Executed",
];

const options = ["Against", "For", "Abstain"];
const colors = [
  "bg-red-700 hover:bg-red-500",
  "bg-green-700 hover:bg-green-500",
  "bg-gray-700 hover:bg-gray-500",
];

const ProposalView: FC<{ proposal: any; index: number }> = ({
  proposal: {
    proposalId,
    state,
    proposer,
    description,
    startBlock,
    endBlock,
    calldatas,
    values,
    targets,
    againstVotes,
    abstainVotes,
    forVotes,
    votingPower,
    voted,
  },
  index,
}) => {
  const [{ provider, address }] = useWallet();

  const contract = new ethers.Contract(
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    ABI,
    (provider as ethers.providers.Web3Provider)?.getSigner?.() ?? provider
  );

  return (
    <>
      <div
        className="justify-center px-2 py-3 border border-black rounded-lg gap-x-2"
        key={proposalId}
      >
        <div className="flex flex-wrap justify-between px-2 py-2 text-lg bg-blue-300 rounded-md gap-x-5">
          <div className="text-xl font-bold ">Proposal #{index}</div>
          <div>By: {proposer}</div>
          <div className="font-semibold"> {ProposalState[state]}</div>
        </div>

        <div className="p-2 bg-blue-200">
          <div className="text-xl underline ">Description</div> {description}
        </div>

        <div className="p-2">
          <div className="text-xl underline">Voting </div>
          <div>
            starts at block {startBlock}, ends at {endBlock}
          </div>
          {address && (
            <div>
              {address && <div>Your voting power: {votingPower}</div>}
              {address && voted && (
                <div className="py-2 text-lg text-center bg-yellow-100">
                  You have already voted
                </div>
              )}
              {address && !voted && state === 1 && (
                <div className="flex gap-x-2">
                  {options.map((option, idx) => (
                    <button
                      className={`px-3 shrink-0 grow py-2 text-white ${colors[idx]}`}
                      key={idx}
                      onClick={() => {
                        contract.castVote(proposalId, idx);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-around px-5 pt-2">
                <div className="p-3 bg-red-100 rounded-lg">
                  Against: {againstVotes}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  For: {forVotes}
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  Abstain: {abstainVotes}
                </div>
              </div>
            </div>
          )}
        </div>

        {address && state === 4 && (
          <button
            onClick={() => {
              contract.queue(
                targets,
                values,

                calldatas,
                ethers.utils.id(description)
              );
            }}
          >
            QUEUE
          </button>
        )}
        {address && state === 5 && (
          <button
            onClick={() => {
              contract.execute(
                targets,
                values,
                calldatas,
                ethers.utils.id(description)
              );
            }}
          >
            EXECUTE
          </button>
        )}
      </div>
    </>
  );
};

export default ProposalView;
