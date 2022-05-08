import { ethers } from "ethers";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import ABI from "../ABI/SmileyGovernor.json";
import SMILEY_ABI from "../ABI/SmileyVotingTokens.json";
import { useWallet } from "../wallet/WalletContext";
import ConnectButton from "./ConnectButton";

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
const DAO: FC = () => {
  const [{ provider, address }] = useWallet();

  const contract = new ethers.Contract(
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
    ABI,
    (provider as ethers.providers.Web3Provider)?.getSigner?.() ?? provider
  );

  const [balance, setBalance] = useState(0);
  const [delegated, setDelegated] = useState(0);

  const [proposals, setProposals] = useState<any>([]);
  const options = ["Against", "For", "Abstain"];
  const colors = [
    "bg-red-700 hover:bg-red-500",
    "bg-green-700 hover:bg-green-500",
    "bg-gray-700 hover:bg-gray-500",
  ];
  const updateBalance = async () => {
    const blockNumber = await provider?.getBlockNumber();
    console.log(blockNumber);

    const votes = await contract?.getVotes(address, blockNumber! - 1);
    setDelegated(votes.toNumber());
    const contractSmiley = new ethers.Contract(
      "0x0165878A594ca255338adfa4d48449f69242Eb8F",
      SMILEY_ABI,
      (provider as ethers.providers.Web3Provider)?.getSigner()
    );
    const balance = await contractSmiley?.balanceOf(address);
    setBalance(balance.toNumber());
    const proposalFilter = contract.filters.ProposalCreated();
    const events = await contract.queryFilter(proposalFilter);
    const mapped = await Promise.all(
      events.map(
        async ({
          args: {
            proposer,
            description,
            calldatas,
            targets,
            proposalId,
            startBlock,
            endBlock,
            3: values,
          },
        }: any) => {
          const state = await contract.state(proposalId);

          const { againstVotes, abstainVotes, forVotes } =
            await contract.proposalVotes(proposalId);
          console.log(await contract.proposalVotes(proposalId));

          const voted = address
            ? await contract.hasVoted(proposalId.toString(), address)
            : null;
          const votingPower = address
            ? await contract.getVotes(
                address,
                Math.min(startBlock.toNumber(), blockNumber! - 1)
              )
            : 0;

          return {
            proposer,
            description,
            proposalId: proposalId.toString(),
            startBlock: startBlock.toString(),
            endBlock: endBlock.toString(),
            state,
            calldatas,
            values: values.map((v: any) => v.toString()),
            targets,
            againstVotes: againstVotes.toString(),
            abstainVotes: abstainVotes.toString(),
            forVotes: forVotes.toString(),
            votingPower: votingPower.toString(),
            voted,
          };
        }
      )
    );
    setProposals(mapped);
  };
  useEffect(() => {
    if (address) updateBalance();
  }, [provider, address]);
  return (
    <>
      <div className="flex items-start justify-center w-full">
        <div className="pt-2 text-lg ">
          <div className="border-b border-gray-700 p-y-1">
            Your balance: {balance}{" "}
          </div>
          <div className="py-1 border-b border-gray-700">
            Voting power delegated to you: {delegated}
          </div>
          <div className="py-1">
            delegate to: <input />
            {address ? (
              <button
                className="px-3 py-2 ml-2 text-white bg-blue-900 rounded-md"
                onClick={async () => {
                  const contract = new ethers.Contract(
                    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
                    SMILEY_ABI,
                    (provider as ethers.providers.Web3Provider)?.getSigner()
                  );
                  const tx = await contract.delegate(
                    (provider as ethers.providers.Web3Provider)
                      ?.getSigner()
                      .getAddress()
                  );
                  await tx.wait();
                }}
              >
                Delegate
              </button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
        <Link href="/create">
          <button>Create a proposal</button>
        </Link>
      </div>
      <div className="py-4">
        {proposals.length === 0 && (
          <div className="w-full px-5 py-4 text-xl font-bold text-center ">
            No proposals....
          </div>
        )}
        {proposals.map(
          (
            {
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
            }: any,
            i: number
          ) => (
            <>
              <div
                className="justify-center px-2 py-3 border border-black rounded-lg gap-x-2"
                key={proposalId}
              >
                <div className="flex justify-between px-2 py-2 text-lg bg-blue-300 rounded-md gap-x-5">
                  <div className="text-xl font-bold ">Proposal #{i}</div>
                  <div>By: {proposer}</div>
                  <div className="font-semibold"> {ProposalState[state]}</div>
                </div>

                <div className="p-2 bg-blue-200">
                  <div className="text-xl underline ">Description</div>{" "}
                  {description}
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
          )
        )}
      </div>
    </>
  );
};

export default DAO;
