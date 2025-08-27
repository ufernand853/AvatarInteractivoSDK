"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type ProductSelection = {
  title: string;
  description: string;
  color: string;
  size: string;
};

interface ProductFormPanelProps {
  onAdd?: (product: ProductSelection) => void;
}

export const productImages = [
  {
    src: "/images/product1.jpg",
    link: "https://example.com/product1",
    alt: "Producto 1",
    title: "Producto 1",
    description: "Descripción del Producto 1",
  },
  {
    src: "/images/product2.jpg",
    link: "https://example.com/product2",
    alt: "Producto 2",
    title: "Producto 2",
    description: "Descripción del Producto 2",
  },
  {
    src: "/images/product3.jpg",
    link: "https://example.com/product3",
    alt: "Producto 3",
    title: "Producto 3",
    description: "Descripción del Producto 3",
  },
];

export const COLOR_MAP: Record<string, string> = {
  Rojo: "red",
  Verde: "green",
  Azul: "blue",
};

export default function ProductFormPanel({ onAdd }: ProductFormPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const colors = Object.keys(COLOR_MAP);
  const sizes = ["S", "M", "L", "XL"];
  const cssColor = COLOR_MAP[selectedColor] || "transparent";

  return (
    <div className="w-[300px] p-4 bg-gray-900 text-white rounded-xl shadow-lg flex flex-col gap-4">
      <h3 className="text-lg font-bold">Agregar Producto</h3>

      {/* Miniaturas como slider básico */}
      <div className="flex gap-2 overflow-x-auto">
        {productImages.map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => {
              setTitle(item.title);
              setDescription(item.description);
            }}
          >
            <Link legacyBehavior href={item.link}>
              <a href={item.link} rel="noopener noreferrer" target="_blank">
                <Image
                  alt={item.alt}
                  className="rounded-lg hover:scale-105 transition-transform"
                  height={80}
                  src={item.src}
                  width={80}
                />
              </a>
            </Link>
          </div>
        ))}
      </div>

      <input
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        placeholder="Nombre del producto"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
      >
        <option value="">Seleccione un color</option>
        {colors.map((color) => (
          <option key={color}>{color}</option>
        ))}
      </select>

      <select
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        value={selectedSize}
        onChange={(e) => setSelectedSize(e.target.value)}
      >
        <option value="">Seleccione un tamaño</option>
        {sizes.map((size) => (
          <option key={size}>{size}</option>
        ))}
      </select>

      {title && (
        <div className="p-2 border rounded" style={{ borderColor: cssColor }}>
          <p className="font-bold">{title}</p>
          {description && <p className="text-sm">{description}</p>}
          {selectedColor && <p className="text-sm">Color: {selectedColor}</p>}
          {selectedSize && <p className="text-sm">Tamaño: {selectedSize}</p>}
        </div>
      )}

      <button
        className="mt-2 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded"
        onClick={() =>
          onAdd?.({
            title,
            description,
            color: selectedColor,
            size: selectedSize,
          })
        }
      >
        Agregar al Carrito
      </button>
    </div>
  );
}
