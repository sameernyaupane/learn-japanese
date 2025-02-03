import { useState, useEffect } from "react";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleClick = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
  };

  return (
    <div className="relative">
      <ClipboardIcon
        className={`h-5 w-5 cursor-pointer rounded p-1 ${
          isCopied ? "text-green-500" : "text-gray-500 hover:bg-gray-100"
        }`}
        onClick={handleClick}
      />
      {isCopied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white animate-[fadeOut_2000ms_ease-in-out_forwards]">
          Copied!
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 transform bg-gray-800" />
        </div>
      )}
    </div>
  );
} 