import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
} from "@heygen/streaming-avatar";

import ProductFormPanel, {
  ProductSelection,
  productImages,
  COLOR_MAP,
} from "./ProductFormPanel";

import { detectarUrlDesdeMensaje } from "@/app/utils/detectarUrlDesdeMensaje";
import { STT_LANGUAGE_LIST } from "@/app/lib/constants";

interface CartItem extends ProductSelection {}

export default function VendedorInteractivo() {
  const [stream, setStream] = useState<MediaStream>();
  const [data, setData] = useState<StartAvatarResponse>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [language, setLanguage] = useState("es");

  const productInfo = productImages
    .map((p) => `${p.title}: ${p.description}`)
    .join(". ");
  const defaultKnowledgeBase = [
    `Eres un vendedor que ofrece los siguientes productos: ${productInfo}.`,
    "Ayuda al cliente a escoger de forma cordial.",
  ].join(" ");
  const [knowledgeBaseText, setKnowledgeBaseText] =
    useState(defaultKnowledgeBase);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = false;
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
      language,
      knowledgeBase: knowledgeBaseText,
    });

    setData(res);
    await avatar.current.startVoiceChat({ isInputAudioMuted: false });
  }

  async function reloadKnowledgeBase() {
    await avatar.current?.stop();
    await avatar.current?.close();
    setData(undefined);
    await startSession();
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
      // eslint-disable-next-line no-console
      console.error("Error creating order", e);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-xl bg-black"
        >
          <track kind="captions" />
        </video>
        <div className="mt-4 flex flex-col items-center gap-2">
          <select
            className="px-2 py-1 border border-gray-300 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {STT_LANGUAGE_LIST.map((lang) => (
              <option key={lang.key} value={lang.key}>
                {lang.label}
              </option>
            ))}
          </select>
          {!data && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={startSession}
            >
              Iniciar sesión
            </button>
          )}
          {data && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={reloadKnowledgeBase}
            >
              Actualizar conocimiento
            </button>
          )}
        </div>
        <textarea
          className="mt-4 max-w-xl w-full text-xs text-gray-700 p-2 border rounded"
          rows={4}
          value={knowledgeBaseText}
          onChange={(e) => setKnowledgeBaseText(e.target.value)}
        />
      </div>
      {showPanel && <ProductFormPanel onAdd={handleAddProduct} />}
      {cart.length > 0 && (
        <div className="w-[300px] p-4 bg-gray-800 text-white rounded flex flex-col gap-2">
          <h3 className="text-lg font-bold">Pedido Tentativo</h3>
          <ul className="flex-1 overflow-y-auto">
            {cart.map((item, idx) => (
              <li key={idx} className="text-sm flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLOR_MAP[item.color] || "transparent",
                  }}
                />
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
