import React from "react";

export default function AppContainer({ children }) {
  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="w-[390px] bg-[#FFF9EC] shadow-lg min-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
