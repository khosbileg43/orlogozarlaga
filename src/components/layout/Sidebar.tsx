import { SquareUserRound } from "lucide-react";
import React from "react";

const Sidebar = () => {
  return (
    <div className="bg-[#1F2421] text-[#F1F3F2] p-5 w-1/5 fixed h-screen top-0 left-0 flex flex-col gap-15 ">
      <div className="flex gap-3 items-center ">
        <div className="bg-transparent rounded-[5px] border border-[#F1F3F2] w-9 h-9 flex items-center justify-center">
          <span className="text-[18px] uppercase">OZ</span>
        </div>
        <span className="text-[16px] uppercase">orlogo-zarlaga</span>
      </div>
      <div className="h-full w-full flex flex-col gap-4">
        <div className="bg-[#4C504D] rounded-lg  flex py-1 px-3">
          <p>My Pocket</p>
        </div>
        <div className="bg-transparent rounded-lg  flex py-1 px-3">
          <p>Lobby</p>
        </div>
        <div className="bg-transparent rounded-lg  flex py-1 px-3">
          <p>Ur Zeel</p>
        </div>
        <div className="bg-transparent rounded-lg  flex py-1 px-3">
          <p>Settings</p>
        </div>
      </div>
      <div className="flex bg-transparent rounded-lg border border-[#F1F3F2] p-2 gap-1 items-center w-full">
        <SquareUserRound size={30} />
        <p>Username</p>
      </div>
    </div>
  );
};

export default Sidebar;
