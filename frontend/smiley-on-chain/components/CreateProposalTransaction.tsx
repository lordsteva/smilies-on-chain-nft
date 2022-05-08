import { ethers } from "ethers";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Transaction } from "./CreateProposal";

const CreateProposalTransaction: FC<{
  transaction: Transaction;
  idx: number;
  onChange: (index: number, key: string, value: string) => void;
  setCalldata: Dispatch<SetStateAction<string[][]>>;
  calldata: string[][];
  onCalldataChange: (index: number, key: number, value: string) => void;
  removeTransaction: (index: number) => void;
  errors: boolean[];
  setErrors: Dispatch<SetStateAction<boolean[]>>;
}> = ({
  transaction,
  idx,
  onChange,
  calldata,
  errors,
  setCalldata,
  onCalldataChange,
  removeTransaction,
  setErrors,
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (errors[idx] !== error) {
      setErrors(errors.map((e, i) => (i === idx ? error : e)));
    }
  }, [error]);
  const abi = transaction.ABI;
  let iface: ethers.utils.Interface;
  let abiError = false;
  let customAbi = false;
  try {
    iface = new ethers.utils.Interface(abi);
    customAbi = true;
  } catch (e) {
    if (abi !== "") {
      abiError = true;
    }
    iface = new ethers.utils.Interface(["function transfer()"]);
  }

  let func = iface.functions[transaction.function];
  if (!func) {
    const fToUse = Object.keys(iface.functions).filter(
      (key) => iface.functions[key].stateMutability !== "view"
    )[0];

    func = iface.functions[fToUse];

    onChange(idx, "function", fToUse);
    const mappedCd = calldata.map((c, i) => {
      if (i !== idx) return c;
      return func.inputs.map(() => "");
    });
    setCalldata(mappedCd);
  }
  let err = false;
  const payable = customAbi ? func.payable : true;
  if (!payable && transaction.value !== "0") {
    onChange(idx, "value", "0");
  }
  try {
    iface.encodeFunctionData(func, calldata[idx]);
  } catch (e) {
    err = true;
  }
  let valueError = false;
  try {
    const value = ethers.utils.parseEther(transaction.value);
    valueError = value.isNegative();
  } catch (e) {
    valueError = true;
  }

  const addressError = !ethers.utils.isAddress(transaction.target);

  const globalError = addressError || valueError || err;
  if (error !== globalError) setError(globalError);
  return (
    <div
      key={idx}
      className={`bg-blue-200 flex flex-col border px-3 py-2 gap-y-2  ${
        globalError ? "border-red-500" : "border-black"
      }`}
    >
      <div className={`text-red-600 ${err ? "" : "invisible"}`}>
        Error! Check your calldata types
      </div>
      <div>
        <div>
          <span>Target: </span>
          <span className={`text-red-600 ${addressError ? "" : "invisible"}`}>
            Invalid address
          </span>
        </div>
        <input
          className={`w-full ${addressError ? "border-red-500 border" : ""}`}
          placeholder="Address"
          value={transaction.target}
          onChange={(e) => onChange(idx, "target", e.target.value)}
        />
      </div>
      <div>
        <div>
          <span>Value (ETH): </span>
          <span
            className={`text-red-600 ${
              payable && valueError ? "" : "invisible"
            }`}
          >
            Bad Value
          </span>
        </div>
        <input
          className={`w-full ${
            payable && valueError ? "border-red-500 border" : ""
          }`}
          disabled={!payable}
          placeholder="Value in ETH"
          value={transaction.value}
          onChange={(e) => onChange(idx, "value", e.target.value)}
        />
      </div>
      <div>
        <div>
          <span>ABI: </span>
          <span className={`text-red-600 ${abiError ? "" : "invisible"}`}>
            Bad ABI
          </span>
        </div>
        <textarea
          rows={5}
          className={` w-full ${abiError ? "border-red-500 border" : ""}`}
          placeholder="Contract ABI, leave blank for ETH transfer"
          value={transaction.ABI}
          onChange={(e) => onChange(idx, "ABI", e.target.value)}
        />
      </div>
      <div>
        <div>Function:</div>
        <select
          className="w-full"
          onChange={(e) => {
            const mappedCd = calldata.map((c, i) => {
              if (i !== idx) return c;
              const key = iface.functions[e.target.value];
              return key.inputs.map(() => "");
            });
            setCalldata(mappedCd);
            onChange(idx, "function", e.target.value);
          }}
          value={transaction.function}
        >
          {Object.keys(iface.functions)
            .filter((key) => iface.functions[key].stateMutability !== "view")
            .map((key) => {
              return (
                <option key={key} value={key}>
                  {key}
                </option>
              );
            })}
        </select>
      </div>
      {calldata[idx].length > 0 && <div className="underline">Calldata: </div>}
      {calldata[idx].map((cd, i) => {
        const error = cd === "";
        return (
          <div key={i} className="flex gap-x-2">
            <span>
              {iface.functions[transaction.function]?.inputs[i].name}:
            </span>
            <input
              className={error ? "border border-red-600" : ""}
              placeholder={
                iface.functions[transaction.function]?.inputs[i].type
              }
              value={cd}
              onChange={(e) => onCalldataChange(idx, i, e.target.value)}
            />
          </div>
        );
      })}
      {idx !== 0 && (
        <button
          className="px-3 py-2 text-white bg-red-600 "
          onClick={() => removeTransaction(idx)}
        >
          Remove transaction
        </button>
      )}
    </div>
  );
};

export default CreateProposalTransaction;
