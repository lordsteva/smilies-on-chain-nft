import type { NextPage } from "next";
import CreateProposal from "../components/CreateProposal";

const DAOPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-5 bg-blue-100 ">
      <CreateProposal />
    </div>
  );
};

export default DAOPage;
