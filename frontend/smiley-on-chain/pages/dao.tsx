import type { NextPage } from "next";
import DAO from "../components/DAO";

const DAOPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-blue-100">
      <DAO />
    </div>
  );
};

export default DAOPage;
