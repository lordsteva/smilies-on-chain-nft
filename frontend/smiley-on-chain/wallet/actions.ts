import { ethers } from "ethers";

export type WalletAction =
  | SET_ADDRESS
  | SET_NETWORK
  | SET_BALANCE
  | SET_WALLET
  | SET_PROVIDER
  | RESET;

type SET_ADDRESS = {
  type: "SET_ADDRESS";
  payload: string;
};

type SET_NETWORK = {
  type: "SET_NETWORK";
  payload: number;
};

type SET_BALANCE = {
  type: "SET_BALANCE";
  payload: string;
};

type SET_WALLET = {
  type: "SET_WALLET";
  payload: {
    name: string;
  };
};

type SET_PROVIDER = {
  type: "SET_PROVIDER";
  payload: ethers.providers.Provider;
};

type RESET = {
  type: "RESET";
};
