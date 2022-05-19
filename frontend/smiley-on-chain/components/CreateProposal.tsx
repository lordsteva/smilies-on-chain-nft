import { ethers } from "ethers";
import { FC, useState } from "react";
import ABI from "../ABI/SmileyGovernor.json";
import { wrapTransactionWithToast } from "../toast";
import { useWallet } from "../wallet/WalletContext";
import ConnectWallet from "./ConnectWallet";
import CreateProposalTransaction from "./CreateProposalTransaction";

export type Transaction = {
  target: string;
  function: string;
  value: string;
  ABI: string;
};

const defaultTransaction = {
  target: "",
  function: "transfer()",
  value: "0",
  ABI: "",
};

const CreateProposal: FC = () => {
  const [{ provider, address }] = useWallet();

  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([
    defaultTransaction,
  ]);
  const [calldata, setCalldata] = useState<string[][]>([[]]);
  const [errors, setErrors] = useState<boolean[]>([true]);

  const onChange = (index: number, key: string, value: string) => {
    const txs = transactions.map((t, i) => {
      if (index !== i) return t;
      return { ...t, [key]: value };
    });
    setTransactions(txs);
  };

  const onCalldataChange = (index: number, key: number, value: string) => {
    const txs = calldata.map((t, i) => {
      if (index !== i) return t;
      t[key] = value;
      return t;
    });
    setCalldata(txs);
  };
  const removeTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => index !== i));
    setCalldata(calldata.filter((_, i) => index !== i));
    setErrors(errors.filter((_, i) => index !== i));
  };
  if (!address)
    return (
      <div className="w-full">
        <ConnectWallet />
      </div>
    );
  const err = errors.filter(Boolean).length > 0;
  return (
    <div className="flex flex-col w-full max-w-xl px-5 py-3 bg-blue-400 border border-black">
      <span className="pb-2 text-xl underline">Description: </span>
      <textarea
        rows={8}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <div className="pb-2 text-xl underline">Transactions</div>
        <div className="flex flex-col gap-y-3">
          {transactions.map((t, idx) => (
            <CreateProposalTransaction
              key={idx}
              transaction={t}
              idx={idx}
              calldata={calldata}
              onCalldataChange={onCalldataChange}
              onChange={onChange}
              setCalldata={setCalldata}
              removeTransaction={removeTransaction}
              errors={errors}
              setErrors={setErrors}
            />
          ))}
        </div>
        <div className="flex justify-center w-full py-3 gap-x-3">
          <button
            className="px-3 py-2 text-white bg-green-500 hover:bg-green-400"
            onClick={() => {
              setCalldata([...calldata, []]);
              setTransactions([...transactions, defaultTransaction]);
              setErrors([...errors, true]);
            }}
          >
            Add another transaction
          </button>
          <button
            disabled={err}
            className={`px-3 py-2 text-white  ${
              err ? "bg-gray-500" : "bg-green-700 hover:bg-green-400"
            }`}
            onClick={async () => {
              const targets = transactions.map((t) => t.target);
              const values = transactions.map((t) => t.value);
              const calldatas = transactions.map((t, i) => {
                const abi = t.ABI || ["function transfer()"];
                const iface = new ethers.utils.Interface(abi);
                return iface.encodeFunctionData(t.function, calldata[i]);
              });

              const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS!,
                ABI,
                (provider as ethers.providers.Web3Provider)?.getSigner()
              );
              const proposeTx = await contract.propose(
                targets,
                values,
                calldatas,
                description
              );
              await wrapTransactionWithToast(proposeTx);
              location.reload();
            }}
          >
            Propose
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
