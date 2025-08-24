import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents, TaskMode, TaskType, VoiceEmotion,SpeakRequest
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import {AVATARS, STT_LANGUAGE_LIST} from "@/app/lib/constants";

import { Microphone } from "@phosphor-icons/react";
import { Switch } from "@nextui-org/react"; 
import { SpeakerSimpleHigh } from "@phosphor-icons/react";  // ⬅️ agregá este import

import useAvatarTimeout from "@/app/utils/useAvatarTimeout";

import mqtt from 'mqtt';

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [knowledgeBase, setKnowledgeBase] = useState<string>("");
  const knowledgeBaseRef = useRef<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>('en');

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);  
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const index = useRef(0);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const textoAcumulado = useRef("");

  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null);
  const videoList = {
    demo: "/videos/Animacion.mp4",
    productoA: "/videos/Animacion1.mp4",
    productoB: "/videos/Animacion2.mp4",
  };

  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const handleStartMic = async () => {
    avatar.current && avatar.current.unmuteInputAudio();
  };


  const handleStopMic = async () => {
    avatar.current && avatar.current.muteInputAudio();
  };

  const handleStartSpeaker = async () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => (track.enabled = true));
    }
    setIsSpeakerOn(true);
  };

  const handleStopSpeaker = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => (track.enabled = false));
    }
    setIsSpeakerOn(false);
  };

  const toggleTaskType = () => {
    setTaskType(prevType => prevType === TaskType.TALK ? TaskType.REPEAT : TaskType.TALK);
  };
  
  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }

    return "";
  }

  async function saveToLogFile(message : string) {
    try {
      const response = await fetch('/api/add-log-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Log response:", data);
      return data;
    } catch (error) {
      console.error("Error sending log message:", error);
    }
  }
  

  // ✅ Function to load knowledge base from file
  async function fetchKnowledgeBase() {
    try {
      //const res = await fetch("/knowledgeBaseDedicar.txt");
      const res = await fetch("/knowledgeBasePernod.txt");
      const text = await res.text();
  
      console.log("📂 Cargando Knowledge Base:", text);
  
      setKnowledgeBase(text); // Estado React (puede ser lento)
      knowledgeBaseRef.current = text; // Ref (se actualiza inmediatamente)
  
      return text; // Devolvemos el valor cargado para usarlo en startSession()
    } catch (error) {
      console.error("🚨 Error al cargar knowledge base:", error);
      return "";
    }
  }
  

  async function startSession() {
    setIsLoadingSession(true);
    await fetchKnowledgeBase(); // ✅ Load the knowledge base before initializing
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      //console.log("Avatar started talking", e);
      
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      saveToLogFile(`AVATAR message Completo : ${textoAcumulado.current}`);
      //textoAcumulado.current="";
      //console.log("Avatar stopped talking", e);
      
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      setIsUserTalking(false);
    });

    avatar.current?.on(StreamingEvents.USER_SILENCE, () => {
      console.log('User is silent');      
    });

    const predefinedMessagesAvatar = [
      { message: "Ver producto", url: "https://google.com" },
      { message: "Más información", url: "https://ejemplo.com/info" },
      { message: "Contacto", url: "https://www.nodumsoftware.com" }
    ];
  

    avatar.current.on(StreamingEvents.AVATAR_END_MESSAGE, (message) => {

      console.log('Avatar end message:', message);

    });
    
      avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (message) => {
        const receivedMessage = message.detail.message.trim(); // Eliminar espacios extra

        //console.log("Avatar talking message:", receivedMessage);
        
        textoAcumulado.current +=  "" + receivedMessage; //Tratar de sacar la charla completa

        //saveToLogFile(`User message: ${receivedMessage}`);
        // Buscar si el mensaje recibido coincide con uno de los predefinidos
        /*const match = predefinedMessagesAvatar.find(item => item.message.toLowerCase() === receivedMessage.toLowerCase());
  
        if (match) {
            console.log("Redirigiendo a:", match.url);
            openFloatingWindow(match.url); // Carga la URL en el contenedor lateral
        } else {
            console.log("Mensaje no coincide con la lista predefinida.");
        }*/
    });

  const predefinedMessagesUser = [
      { message: "Lince", url: "https://linsse.com/ai" },
      { message: "Linse", url: "https://linsse.com/ai" },
      { message: "Nodum", url: "https://www.nodumsoftware.com" }
  ];
  
  const questions: string[] = [
    "¿Cómo te llamas?",
    "¿Cuántos años tienes?",
    "¿Dónde vives?",
    "¿Cuál es tu comida favorita?",
    "¿Tienes alguna mascota?"
  ];

  
  avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (message) => {
      //console.log("User talking message:", message.detail.message);
      //const receivedMessage = message.detail.message.trim().toLowerCase(); // Eliminar espacios extra y pasar a minúsculas
      const receivedMessage   = limpiar(message.detail.message);
      const avatarMsg = limpiar(textoAcumulado.current);
      textoAcumulado.current="";

      //console.log("Processed user message:", receivedMessage);
      console.log("Pregunta Avatar " + textoAcumulado.current);
      console.log("Respuesta Usuario " + receivedMessage);

      //Aca preciso saber como preparar y que chivas
    try {
     // 1) ¿El avatar preguntó “ver como preparar … con Chivas X”?

     const esBienvenida = /^¡?\s*bienvenido[!¡,.…\s]*/i.test(avatarMsg);

     if (esBienvenida) {
       console.log("El avatar dio la bienvenida.");

       enviarComando();

       return;

     }

      if (/como\s*preparar/.test(avatarMsg)) {

        let tipoWhisky = (avatarMsg.match(/chivas\s*(\d+|extra|mizunara|ultis)/i)?.[0] || "chivas 15").trim();

        // ¿El usuario dice 12, 15, 18, extra… ?
        const eleccionUsuario = receivedMessage.match(/\b(12|15|18|extra|mizunara|ultis)\b/);
        if (eleccionUsuario) tipoWhisky = `chivas ${eleccionUsuario[1]}`;
      
        console.log("Whisky detectado →", tipoWhisky);
        const afirmativo = /\b(s[ií]|claro|dale|ok|sí)\b/i.test(receivedMessage);
        console.log("User dijo:", receivedMessage, "→ afirmativo?", afirmativo);
      
        if (afirmativo) {
          const key = videoPorWhisky[tipoWhisky] ?? "demo";
          playVideo(key);
        }
        
      
      //Reset Conversacion Avatar
      
        return;
      }
   
    } catch (error) {
      console.log("Error" + error);
    }finally {
      // Guardar en log
      saveToLogFile(`User message: ${receivedMessage}`);
    }
  
  });

  /* ── util ── */
function limpiar(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")               // separa acentos
    .replace(/[\u0300-\u036f]/g, '')// elimina acentos
    .trim();
}

/* ── mapping opcional whisky → video ── */
const videoPorWhisky: Record<string, keyof typeof videoList> = {
  "chivas 12":  "productoA",
  "chivas extra": "productoB",
  "chivas 15":  "demo",
  "chivas mizunara": "demo",
  "chivas 18":  "demo",
  "chivas ultis": "demo"
};

async function activarMensaje() {
  setChatMode("text_mode");

  // ✅ Calculamos el siguiente índice
  const nextIndex = index.current + 1;

  // ✅ Verificamos si el índice es válido antes de actualizar
  if (nextIndex >= questions.length) {
    setChatMode("voice_mode");
    console.warn("No hay más preguntas.");
    return;
  }

  // ✅ Actualizamos el índice directamente en `useRef`
  index.current = nextIndex;

  // ✅ Luego de actualizar el índice, ejecutamos `speak()`
  if (avatar.current) {
    const speakRequest = {
      text: questions[nextIndex], // 🔥 Usamos `nextIndex` en lugar de `index`
      task_type: TaskType.REPEAT
    };

    await avatar.current.speak(speakRequest).catch((e) => {
      setDebug(e.message);
    });

    // Volver al modo de voz después de hablar
    setChatMode("voice_mode");
    
  } else {
    console.warn("avatar.current is null, unable to speak.");
    setDebug("El avatar no está disponible.");
  }
}


  function openFloatingWindow(url: string) {
    const width = 400; // Ancho de la ventana
    const height = 600; // Alto de la ventana
    const left = window.innerWidth - width - 10; // Posición en la esquina inferior derecha
    const top = window.innerHeight - height - 10;
  
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
  
    const newWindow = window.open(url, "_blank", features);
    
    if (newWindow) {
      newWindow.focus();
    } else {
      alert("Por favor, habilita las ventanas emergentes para esta página.");
    }
  }
    
  
    try {
      console.log(knowledgeBase);
      console.log("createStartAvatar");
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        //avatarName: avatarId,
        //avatarName: "Abigail_expressive_2024112501",
        //knowledgeId: "9ede796b30e642a9ada046b682af068d", // Or use a custom `knowledgeBase`.
        //avatarName: "Bryan_IT_Sitting_public",
        avatarName: "Graham_Black_Shirt_public",
        knowledgeBase: knowledgeBaseRef.current,
        voice: {
          //voiceId: "6af064a4367c4e1385ece1573ba832f4",
          rate: 1, // 0.5 ~ 1.5
          emotion: VoiceEmotion.FRIENDLY,
          // elevenlabsSettings: {
          //   stability: 1,
          //   similarity_boost: 1,
          //   style: 1,
          //   use_speaker_boost: false,
          // },
        },

        language: language,
        //language: "Spanish",
        disableIdleTimeout: false,
        
      });

      console.log("Resultado CreateStartAvatar");      
      console.log(res);

      setData(res);
      // default to voice mode
      
      await avatar.current?.startVoiceChat({isInputAudioMuted : false});


      //setChatMode("voice_mode");
      //Switch to text mode and send custom message
      /*setChatMode("text_mode");
      const speakRequest: SpeakRequest = { text: `Hola como estas soy el asistente virtual interactivo de Linsse.`, task_type: TaskType.REPEAT };
      await avatar.current.speak(speakRequest).catch((e) => {
        setDebug(e.message);
      });*/

      //Switch to voice mode again
      await handleCustomAction("Hola")

      setChatMode("voice_mode");

      //handleStartListening(); //Para de Escuchar
      //avatar.current.closeVoiceChat();
      
      resetTimer

    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
      handleInterrupt
    }
  
  } //Fin Iniciar Session

  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
  
    console.log("Mandando Pregunta");
    await avatar.current.speak({
      text: text,
      taskType: taskType, // Usamos el estado actual
      taskMode: TaskMode.SYNC
    }).catch((e) => {
      setDebug(e.message);
    });
   
    setIsLoadingRepeat(false);
    await avatar.current?.startVoiceChat();
  }
  
  const handleStartListening = async () => {
    if (avatar.current) {
      await avatar.current.startListening();
      console.log("🎤 Listening started...");
    }
  };

  const handleStopListening = async () => {
    if (avatar.current) {
      await avatar.current.stopListening();
      console.log("🛑 Listening stopped.");
    }
  };

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current
      .interrupt()
      .catch((e) => {
        setDebug(e.message);
      });
  }
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const handleChangeChatMode = useMemoizedFn(async (v) => {
    if (v === chatMode) {
      return;
    }
    if (v === "text_mode") {
      avatar.current?.closeVoiceChat();
    } else {
      await avatar.current?.startVoiceChat();
    }
    setChatMode(v);
  });

  function playVideo(key: keyof typeof videoList) {
    setCurrentVideoSrc(videoList[key]);
    setShowVideoOverlay(true);
  }

  async function handleCustomAction(textTopic: string) {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    console.log("Custom button clicked!");
    await avatar.current.speak({
      text: textTopic,
      taskType: taskType, // Usamos el estado actual
      taskMode: TaskMode.SYNC
    }).catch((e) => {
      setDebug(e.message);
    });
  }

  //Tiempo de Sesion
  const cerrarSesion = () => {
    endSession();
    console.log("🔒 Sesión cerrada");
    // lógica para detener el avatar
  };

  function enviarComando() {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn("MQTT no conectado");
      return;
    }

    // ejemplo: arrancar el avatar
    client.publish("avatar/launch", "on", { qos: 0, retain: false }, (err) => {
      if (err) console.error("Error publicando:", err);
      else console.log("✅ mensaje enviado!");
    });
  }

  const mostrarAlertaUnMinuto = () => {
    console.log("⏳ Queda 1 minuto de sesión");
    setChatMode("text_mode");
      const speakRequest: SpeakRequest = { text: `Queda un minuto de session`, task_type: TaskType.REPEAT };
      if (avatar.current) {
        avatar.current.speak(speakRequest).catch((e) => {
          setDebug(e.message);
        });  
      }
      console.log("⏳ Queda 1 minuto de sesión");
      setChatMode("voice_mode");
    // mostrar cartel, vibrar el borde, etc.
  };
  
  const { resetTimer } = useAvatarTimeout({
    durationMs:  10 * 60 * 1000, // 2 minutos
    onTimeout: cerrarSesion,
    onOneMinuteRemaining: mostrarAlertaUnMinuto,
  });
//Fin Tiempo de Sesion


  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001'); // ej: ws://localhost:9001
    clientRef.current = client; 
    client.on('connect', () => {
      console.log('🔌 Conectado a MQTT');
      client.subscribe('avatar/start', (err) => {
        if (!err) {
          console.log('🟢 Suscrito a avatar/start');
        }
      });
    });
  
    client.on('message', async (topic, message) => {
      const payload = message.toString();
      console.log(`📩 Mensaje recibido en ${topic}: ${payload}`);
  
      if (topic === 'avatar/start' && payload === 'on') {
        await startSession();
      }
    });
  
    return () => {
      client.end();
    };
    }, []);
    
  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              >
                <track kind="captions" />
              </video>
              {showVideoOverlay && currentVideoSrc && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex justify-center items-center">
                  <video
                    controls
                    autoPlay
                    className="w-[80%] h-[80%] rounded-lg shadow-lg"
                  >
                    <source src={currentVideoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Button
                    onPress={() => {
                      setShowVideoOverlay(false);
                      setCurrentVideoSrc(null);
                    }}
                    className="absolute top-4 right-4 bg-red-600 text-white"
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
              <div className="flex flex-col items-center gap-2">
                  <Button
                    onPress={async () => {
                      if (isSpeakerOn) {
                        handleStopSpeaker();
                      } else {
                        handleStartSpeaker();
                      }
                      setIsSpeakerOn(!isSpeakerOn);
                    }}
                    className={`rounded-full p-4 flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isSpeakerOn ? "bg-green-500 hover:bg-green-600" : "bg-indigo-500 hover:bg-indigo-600"
                    }`}
                    variant="shadow"
                    aria-label={isSpeakerOn ? "Silenciar parlante" : "Activar parlante"}
                  >
                    <SpeakerSimpleHigh
                      size={32}
                      weight="fill"
                      color="white"
                      className="transition-colors duration-300"
                    />
                  </Button>
                  <p className={`text-sm font-medium ${isSpeakerOn ? "text-green-500" : "text-indigo-500"}`}>
                    {isSpeakerOn ? "Parlante Activado" : "Parlante Silenciado"}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                <Button
                  onPress={async () => {
                    if (isMicOn) {
                      await handleStopMic();
                    } else {
                      await handleStartMic();
                    }
                    setIsMicOn(!isMicOn);
                  }}
                  className={`rounded-full p-4 flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isMicOn ? "bg-red-500 hover:bg-red-600" : "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                  variant="shadow"
                  aria-label={isMicOn ? "Desactivar micrófono" : "Activar micrófono"}
                >
                  <Microphone
                    size={32}
                    weight="fill"
                    color="white"
                    className="transition-colors duration-300"
                  />
                </Button>
                <p className={`text-sm font-medium ${isMicOn ? "text-red-500" : "text-indigo-500"}`}>
                  {isMicOn ? "Micrófono Activado" : "Micrófono Desactivado"}
                </p>
              </div>

                <Button onPress={() => playVideo("demo")}>Ver Demo</Button>
                <Button onPress={() => playVideo("productoA")}>Producto A</Button>
                <Button onPress={() => playVideo("productoB")}>Producto B</Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onPress={handleInterrupt}
                >
                  Interrumpir
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300  text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onPress={endSession}
                >
                  Finalizar Conversacion
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium leading-none">
                  Custom Knowledge ID (optional)
                </p>
                <Input
                  placeholder="Enter a custom knowledge ID"
                  value={knowledgeId}
                  onChange={(e) => setKnowledgeId(e.target.value)}
                />
                <p className="text-sm font-medium leading-none">
                  Custom Avatar ID (optional)
                </p>
                <Input
                  placeholder="Enter a custom avatar ID"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                />
                <Select
                  placeholder="Or select one from these example avatars"
                  size="md"
                  onChange={(e) => {
                    setAvatarId(e.target.value);
                  }}
                >
                  {AVATARS.map((avatar) => (
                    <SelectItem
                      key={avatar.avatar_id}
                      textValue={avatar.avatar_id}
                    >
                      {avatar.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Select language"
                  placeholder="Select language"
                  className="max-w-xs"
                  selectedKeys={[language]}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                  }}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <SelectItem key={lang.key}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white"
                size="md"
                variant="shadow"
                onPress={startSession}
              >
                Start session
              </Button>
            </div>
          ) : (
            <Spinner color="default" size="lg" />
          )}
        </CardBody>
        <Divider />
        <CardFooter className={`flex flex-col gap-3 relative ${isFooterVisible ? '' : 'hidden'}`}>
          <Tabs
            aria-label="Options"
            selectedKey={chatMode}
            onSelectionChange={(v) => {
              handleChangeChatMode(v);
            }}
          >
            <Tab key="text_mode" title="Text mode" />
            <Tab key="voice_mode" title="Voice mode" />
          </Tabs>
          {chatMode === "text_mode" ? (
            <div className="w-full flex relative">
              <InteractiveAvatarTextInput
                disabled={!stream}
                input={text}
                label="Chat"
                loading={isLoadingRepeat}
                placeholder="Type something for the avatar to respond"
                setInput={setText}
                onSubmit={handleSpeak}
              />
               <Switch 
                isSelected={taskType === TaskType.REPEAT} 
                onChange={toggleTaskType}
                size="lg"
              >
                {taskType === TaskType.TALK ? "Modo TALK" : "Modo SPEAK"}
              </Switch>
              {text && (
                <Chip className="absolute right-16 top-3">Listening</Chip>
              )}
            </div>
          ) : (
            <div className="w-full text-center">
              <Button
                isDisabled={!isUserTalking}
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white"
                size="md"
                variant="shadow"
              >
                {isUserTalking ? "Listening" : "Voice chat"}
              </Button>
            </div>
          )}
          
          
        </CardFooter>

        <CardFooter className="hidden flex flex-row gap-3 justify-center" >
        <Button
            className="hidden bg-gradient-to-tr from-green-400 to-green-200 text-white h-16"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Zuccardi")}
          >
            <img src="/iber/Zuccardi.png" alt="Icono" className="w-12 h-15" />
            Zuccardi
          </Button>

          <Button
            className="hidden bg-gradient-to-tr from-red-400 to-red-200 text-white h-16"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Luca")}
          >
            <img src="/iber/Luca.png" alt="Icono" className="w-10 h-15" />
            Luca
          </Button>

          <Button
            className="hidden bg-gradient-to-tr from-yellow-400 to-yellow-200 text-white h-16"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Bagual")}
          >
            <img src="/iber/Bagual.png" alt="Icono" className="w-10 h-15" />
            Bagual
          </Button>
          
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Asistencia")}
          >
            Solicitar Asistencia
          </Button>

          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Asistencia")}
          >
            Noticias
          </Button>

          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Asistencia")}
          >
            Entretenimiento
          </Button>

          <Button
            className="hidden bg-gradient-to-tr from-blue-400 to-blue-200 text-white h-16"
            size="md"
            variant="shadow"
            onPress={async () => await handleCustomAction("Estela")}
          >
            <img src="/iber/Estela.png" alt="Icono" className="w-10 h-15" />
            Estela
          </Button>

          </CardFooter>
      </Card>
      
      <p className="font-mono text-right">
        <span className="font-bold">Console:</span>
        <br />
        {debug}
      </p>
    </div>
  );
}