import { ethers } from "ethers";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import ABI from "../ABI/SmileyGovernor.json";
import SMILEY_ABI from "../ABI/SmileyVotingTokens.json";
import { wrapTransactionWithToast } from "../toast";
import { useWallet } from "../wallet/WalletContext";
import ConnectButton from "./ConnectButton";
import ProposalView from "./ProposalView";

const DAO: FC = () => {
  const [{ provider, address }] = useWallet();

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS!,
    ABI,
    (provider as ethers.providers.Web3Provider)?.getSigner?.() ?? provider
  );

  const [target, setTarget] = useState(address);

  const addressError = !ethers.utils.isAddress(target ?? "");

  const [balance, setBalance] = useState(0);
  const [delegated, setDelegated] = useState(0);
  const [delegatedTo, setDelegatedTo] = useState(ethers.constants.AddressZero);

  const [proposals, setProposals] = useState<any>([]);
  const updateBalance = async () => {
    const blockNumber = await provider?.getBlockNumber();
    const votes = await contract?.getVotes(address, blockNumber! - 1);
    setDelegated(votes.toNumber());
    const contractSmiley = new ethers.Contract(
      process.env.NEXT_PUBLIC_VOTES_ADDRESS!,
      SMILEY_ABI,
      (provider as ethers.providers.Web3Provider)?.getSigner()
    );
    const balance = await contractSmiley?.balanceOf(address);
    setBalance(balance.toNumber());

    const delegatee = await contractSmiley?.delegates(address);

    setDelegatedTo(delegatee);

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
            Voting power delegated to you (current block): {delegated}
          </div>{" "}
          <div className="py-1">
            {address ? (
              <>
                <div className="flex flex-wrap items-baseline gap-y-2">
                  <div className="pr-2">delegate to: </div>
                  <div className="flex flex-col ">
                    <input
                      className="w-96"
                      placeholder="Address"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    />
                    <div
                      className={`text-red-600 ${
                        addressError ? "" : "invisible"
                      }`}
                    >
                      Invalid address
                    </div>{" "}
                  </div>
                  <button
                    disabled={addressError}
                    className={` px-3 py-2 ml-2 rounded-md text-white  ${
                      addressError
                        ? "bg-gray-500"
                        : "  bg-blue-900 hover:bg-blue-400"
                    }`}
                    onClick={async () => {
                      const contract = new ethers.Contract(
                        process.env.NEXT_PUBLIC_VOTES_ADDRESS!,
                        SMILEY_ABI,
                        (provider as ethers.providers.Web3Provider)?.getSigner()
                      );

                      try {
                        const tx = await contract.delegate(address);
                        await wrapTransactionWithToast(tx);
                        setDelegatedTo(address);
                      } catch (error) {}
                    }}
                  >
                    Delegate
                  </button>
                </div>
                <div>Your votes are deleagted to: {delegatedTo}</div>
              </>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
      <Link href="/create">
        <button className="px-3 py-2 mt-3 ml-2 text-white rounded-md bg-lime-600">
          Create a proposal
        </button>
      </Link>
      <div className="py-4">
        {proposals.length === 0 && (
          <div className="w-full px-5 py-4 text-xl font-bold text-center ">
            No proposals....
          </div>
        )}
        {proposals.map((proposal: any, index: number) => (
          <ProposalView key={index} proposal={proposal} index={index} />
        ))}
      </div>
    </>
  );
};

export default DAO;
