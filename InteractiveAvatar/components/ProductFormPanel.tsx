"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const productImages = [
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

export default function ProductFormPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const colors = ["Rojo", "Verde", "Azul"];
  const sizes = ["S", "M", "L", "XL"];

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
            <Link href={item.link} legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                <Image
                    src={item.src}
                    alt={item.alt}
                    width={80}
                    height={80}
                    className="rounded-lg hover:scale-105 transition-transform"
                />
                </a>
            </Link>
            </div>
        ))}
        </div>


      <input
        type="text"
        placeholder="Nombre del producto"
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Descripción"
        className="px-3 py-2 rounded bg-gray-800 border border-gray-700"
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

      <button className="mt-2 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded">
        Agregar al Carrito
      </button>
    </div>
  );
}
