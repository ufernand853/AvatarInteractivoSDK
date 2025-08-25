"use client";

import VendedorInteractivo from "@/components/VendedorInteractivo";

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        <div className="w-full">
          <VendedorInteractivo />
        </div>
      </div>
    </div>
  );
}
