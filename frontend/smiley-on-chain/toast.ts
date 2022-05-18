import { toast } from "react-toastify";

export const wrapTransactionWithToast = async (tx: any) => {
  try {
    toast.info("Transaction sent! Wait for confirmation...");
    await tx.wait();

    toast.info("Transaction confirmed!");
  } catch (err) {
    toast.error("Something went wrong!");
  }
};
