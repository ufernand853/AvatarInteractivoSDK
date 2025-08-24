import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar";

import ProductFormPanel, { ProductSelection } from "./ProductFormPanel";

import { detectarUrlDesdeMensaje } from "@/app/utils/detectarUrlDesdeMensaje";

interface CartItem extends ProductSelection {}

export default function VendedorInteractivo() {
  const [stream, setStream] = useState<MediaStream>();
  const [data, setData] = useState<StartAvatarResponse>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      avatar.current?.stop();
      avatar.current?.close();
    };
  }, []);

  async function fetchAccessToken() {
    const res = await fetch("/api/get-access-token", { method: "POST" });

    return res.text();
  }

  async function startSession() {
    const token = await fetchAccessToken();

    avatar.current = new StreamingAvatar({ token });

    avatar.current.on(StreamingEvents.STREAM_READY, (e) => {
      setStream(e.detail);
    });

    avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (e) => {
      const msg = e.detail.message;
      const url = detectarUrlDesdeMensaje(msg);

      if (url) {
        setShowPanel(true);
      }
    });

    const res = await avatar.current.createStartAvatar({
      quality: AvatarQuality.Low,
      avatarName: "Ann_Therapist_public",
    });

    setData(res);
    await avatar.current.startVoiceChat({ isInputAudioMuted: false });
  }

  const handleAddProduct = (product: CartItem) => {
    setCart((prev) => [...prev, product]);
  };

  const handleFinalizeOrder = async () => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      setCart([]);
      setShowPanel(false);
    } catch (e) {
      console.error("Error creating order", e);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xl bg-black"
        />
        {!data && (
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={startSession}
          >
            Iniciar sesión
          </button>
        )}
      </div>
      {showPanel && <ProductFormPanel onAdd={handleAddProduct} />}
      {cart.length > 0 && (
        <div className="w-[300px] p-4 bg-gray-800 text-white rounded flex flex-col gap-2">
          <h3 className="text-lg font-bold">Pedido Tentativo</h3>
          <ul className="flex-1 overflow-y-auto">
            {cart.map((item, idx) => (
              <li key={idx} className="text-sm">
                {item.title} - {item.color} {item.size}
              </li>
            ))}
          </ul>
          <button
            className="mt-2 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded"
            onClick={handleFinalizeOrder}
          >
            Finalizar pedido
          </button>
        </div>
      )}
    </div>
  );
}
