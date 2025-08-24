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
import { Switch } from "@nextui-org/react";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import {AVATARS, STT_LANGUAGE_LIST} from "@/app/lib/constants";

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

  const toggleTaskType = () => {
    setTaskType(prevType => prevType === TaskType.TALK ? TaskType.REPEAT : TaskType.TALK);
  };

  //Inicio Session
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SESSION_DURATION_MINUTES = 1; // ⏱ Duración configurable

  const textoAcumuladoRef = useRef<string>('');

  function agregarTextoASesion(nuevoTexto: string) {
    textoAcumuladoRef.current += `${nuevoTexto.trim()}\n`;
  }

  async function guardarTextoDeSesion() {
    if (!sessionId || !textoAcumuladoRef.current.trim()) return;
    try {
      const response = await fetch('http://34.173.139.2:5000/data-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          text: textoAcumuladoRef.current.trim()
        })
      });
      const result = await response.json();
      console.log('✅ Texto acumulado guardado:', result);
    } catch (error) {
      console.error('❌ Error guardando texto acumulado:', error);
    }
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('http://34.173.139.2:5000/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionId(data.sessionId);
        localStorage.setItem('sessionId', data.sessionId);
        setLoginError('');
        setIsAuthenticated(true); // 🔑 Esto habilita la vista del avatar
        if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = setTimeout(() => {
          const cerrarSesion = async () => {
            console.log("⏳ Sesión expirada. Cerrando sesión automáticamente.");
            if (avatar.current) {
              try {
                await avatar.current.stopAvatar();
              } catch (e) {
                console.error("Error al cerrar sesión del avatar:", e);
              }
            }
            await guardarTextoDeSesion();
            setIsAuthenticated(false);
            setUsuario("");
            setContraseña("");
            setSessionId("");
            localStorage.removeItem("sessionId");
            setStream(undefined);
          };
        
          cerrarSesion();
        }, SESSION_DURATION_MINUTES * 60 * 1000);
        
      } else {
        setLoginError(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setLoginError('Error de red o servidor');
      console.error(error);
    }
  };

  useEffect(() => {
    const videoEl = mediaStream.current;
    if (isAuthenticated && stream && videoEl) {
      console.log("🎥 Asignando stream tras login");
      videoEl.srcObject = stream;
      videoEl.onloadedmetadata = () => {
        videoEl.play();
      };
    }
  }, [isAuthenticated, stream]);
  
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      if (avatar.current) {
        avatar.current.stopAvatar().catch((e) => {
          console.error("Error al desmontar avatar:", e);
        });
      }
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col gap-4">
            <Input
              type="email"
              label="Correo"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
            <Input
              type="password"
              label="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <Button
              className="bg-indigo-500 text-white"
              onClick={handleLogin}
            >
              Iniciar sesión
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
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
                <div className="flex flex-col gap-2 absolute bottom-3 right-3">
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
                  <Button onPress={() => {
                    if (mediaStream.current && stream) {
                      mediaStream.current.srcObject = stream;
                      mediaStream.current.play();
                      console.log("🎬 Forzado a reproducir video");
                    }
                  }}>
                    Forzar video
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

          <CardFooter className="flex flex-row gap-3 justify-center hidden">
          <Button
              className="bg-gradient-to-tr from-green-400 to-green-200 text-white h-16"
              size="md"
              variant="shadow"
              onPress={async () => await handleCustomAction("Porcelanato Parma")}
            >
              <img src="/castro/porcparma.webp" alt="Icono" className="w-12 h-15" />
              Porcelanato Parma
            </Button>

            <Button
              className="bg-gradient-to-tr from-red-400 to-red-200 text-white h-16"
              size="md"
              variant="shadow"
              onPress={async () => await handleCustomAction("Porcelanato Palma")}
            >
              <img src="/castro/porcpalma.webp" alt="Icono" className="w-10 h-15" />
              Porcelanato Palma
            </Button>

            <Button
              className="bg-gradient-to-tr from-yellow-400 to-yellow-200 text-white h-16"
              size="md"
              variant="shadow"
              onPress={async () => await handleCustomAction("Porcelanato Negro")}
            >
              <img src="/castro/porcnegro.webp" alt="Icono" className="w-10 h-15" />
              Porcelanato Negro
            </Button>
            
            <Button
              className="bg-gradient-to-tr from-blue-400 to-blue-200 text-white h-16"
              size="md"
              variant="shadow"
              onPress={async () => await handleCustomAction("Porcelanato Grey")}
            >
              <img src="/castro/porcgrey.webp" alt="Icono" className="w-10 h-15" />
              Porcelanato Grey
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
  

  //Fin Session

 

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
      const res = await fetch("/knowledgeBase.txt");
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
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Permiso de micrófono concedido.");
    } catch (err) {
      console.error("No se pudo acceder al micrófono:", err);
      return;
    }

    setIsLoadingSession(true);
    await fetchKnowledgeBase(); // ✅ Load the knowledge base before initializing
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("Avatar started talking", e);
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("Avatar stopped talking", e);
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

      console.log('Avatar end message:', message.detail.message);

    });
    
    avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (message) => {
        const receivedMessage = message.detail.message.trim(); // Eliminar espacios extra
    
        console.log("Avatar talking message:", receivedMessage);
        
        //saveToLogFile(`Avatar message: ${receivedMessage}`);
        // Buscar si el mensaje recibido coincide con uno de los predefinidos
        const match = predefinedMessagesAvatar.find(item => item.message.toLowerCase() === receivedMessage.toLowerCase());
        agregarTextoASesion(`Avatar: ${receivedMessage}`);
        if (match) {
            console.log("Redirigiendo a:", match.url);
            openFloatingWindow(match.url); // Carga la URL en el contenedor lateral
        } else {
            console.log("Mensaje no coincide con la lista predefinida.");
        }
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
      console.log("User talking message:", message.detail.message);
      const receivedMessage = message.detail.message.trim().toLowerCase(); // Eliminar espacios extra y pasar a minúsculas
  
      console.log("Processed user message:", receivedMessage);
  
          // Guardar en log
      //saveToLogFile(`User message: ${receivedMessage}`);
      agregarTextoASesion(`User: ${receivedMessage}`);
      // Buscar si alguna de las palabras clave está contenida en el mensaje recibido
      const match = predefinedMessagesUser.find(item => receivedMessage.includes(item.message.toLowerCase()));
  
      if (match) {
        
          console.log("Abriendo en nueva ventana:", match.url);
          openFloatingWindow(match.url); // Carga la URL en el contenedor lateral
      } else {
          console.log("Mensaje no coincide con la lista predefinida.");
      }

      //activarMensaje(); De la lista de Mensajes
      
  });


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
        //avatarName: "Dexter_Lawyer_Sitting_public",
        avatarName: "June_HR_public",
        knowledgeBase: knowledgeBaseRef.current,
        voice: {
          //voiceId: "6af064a4367c4e1385ece1573ba832f4",
          voiceId: "0a82bb7441ca46eb8ec3f20b88249ebe",
          rate: 1, // 0.5 ~ 1.5
          emotion: VoiceEmotion.FRIENDLY,
          // elevenlabsSettings: {
          //   stability: 1,
          //   similarity_boost: 1,
          //   style: 1,
          //   use_speaker_boost: false,
          // },
        },
        // voiceId: "6af064a4367c4e1385ece1573ba832f4", - Mi Voz suena bien español
        // voiceId: "0a82bb7441ca46eb8ec3f20b88249ebe", - Voz femenina joven suena bien en español
        language: language,
        //language: "Spanish",
        disableIdleTimeout: false,
      });

      console.log("Resultado CreateStartAvatar");      
      console.log(res);

      setData(res);
      // default to voice mode
      
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false
      });

      //setChatMode("voice_mode");
      //Switch to text mode and send custom message
      /*setChatMode("text_mode"); //Ulises 26/03--Comendato temporalmente por demo a Fer RRHH
      const speakRequest: SpeakRequest = { text: `Hola Estoy aqui para charlar contigo. Como estás?`, task_type: TaskType.REPEAT };
      await avatar.current.speak(speakRequest).catch((e) => {
        setDebug(e.message);
      });*/

      //Switch to voice mode again
      setChatMode("voice_mode");
      
      //avatar.current.closeVoiceChat();
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }

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
    await guardarTextoDeSesion();
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

  
  
}