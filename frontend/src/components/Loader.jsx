import React from "react";
import { Zap } from "lucide-react";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Zap className="w-12 h-12 text-brand-primary animate-pulse" />
      <p className="mt-4 text-lg font-medium text-gray-600">{message}</p>
    </div>
  );
};

export default Loader;
