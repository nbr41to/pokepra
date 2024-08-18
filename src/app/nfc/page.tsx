"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [reader, setReader] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      interface Window {
        NDEFReader: any;
      }
      const ndefReader = new (window as Window).NDEFReader();
      console.log("ndefReader", ndefReader);
      setReader(ndefReader);
    }
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-6">
      <h2 className="font-bold">NFC Test</h2>
      <p>NDEFReader: {JSON.stringify(reader)}</p>
    </div>
  );
}
