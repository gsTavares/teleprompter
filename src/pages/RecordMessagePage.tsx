import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  useIonViewDidEnter
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { getMessages, MessageSchema } from "../services/database";

const RecordMessagePage: React.FC = () => {
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageSchema>();
  const [speed, setSpeed] = useState(20); // pixels por segundo
  const [isRecording, setIsRecording] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false); // controla o início da rolagem

  const videoRef = useRef<HTMLVideoElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useIonViewDidEnter(() => {
    const fetchMessages = async () => {
      const response = await getMessages();
      setMessages(response);
    };

    fetchMessages();
    startCamera();
  });

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true,
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]); // remove o prefixo base64
      reader.readAsDataURL(blob);
    });
  }

  // Função que inicia a rolagem somente quando `isScrolling` for true
  const startAutoScroll = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const scrollStep = () => {
      if (promptRef.current && isScrolling) {
        promptRef.current.scrollTop += (speed / 20);
        // Como roda a cada ~50ms, ajustamos a quantidade
        // (pixels por segundo) / 20 = pixels por ciclo
      }
      // Agenda a próxima execução
      timeoutRef.current = window.setTimeout(scrollStep, 50);
    };

    // Começa a rolar
    scrollStep();
  };

  // Controla a parada da rolagem
  const stopAutoScroll = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Quando uma mensagem for selecionada, define que a rolagem pode começar
  useEffect(() => {
    if (selectedMessage) {
      // Aqui, a rolagem só começará quando `isScrolling` estiver true (injeção no início da gravação)
    }
  }, [selectedMessage]);

  // Começa a rolagem na início da gravação
  const startRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recordedChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

      const platform = Capacitor.getPlatform();

      if (platform === 'android') {
        // Android nativo: salvar com Filesystem + MediaScanner
        const base64Data = await blobToBase64(blob) as string;
        const fileName = `${selectedMessage?.title}-${Date.now()}.webm`;

        await Filesystem.writeFile({
          path: `DCIM/Teleprompt/${fileName}`,
          data: base64Data,
          directory: Directory.ExternalStorage,
        });

        alert('📹 Vídeo salvo na galeria!');
      } else {
        // Navegador: download com a tag <a>
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "teleprompt-recording.webm";
        a.click();
      }
    };

    recorder.start();
    setIsRecording(true);
    setIsScrolling(true); // inicia a rolagem ao começar a gravação
  };

  // Parar gravação e a rolagem ao parar
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsScrolling(false); // para a rolagem
    // Para garantir que o setTimeout pare, podemos limpar
    stopAutoScroll();
  };

  // Quando `isScrolling` mudar, inicia ou para a rolagem
  useEffect(() => {
    if (isScrolling) {
      // Inicia a rolagem
      startAutoScroll();
    } else {
      // Para a rolagem
      stopAutoScroll();
    }

    // Limpa o timeout na desmontagem ou mudança
    return () => {
      stopAutoScroll();
    };
  }, [isScrolling, speed]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonText>
                <h1 className="ms-4">Gravar mensagem</h1>
              </IonText>

              <IonItem
                lines="none"
                className={`rounded-lg border border-gray-300 mx-4 mb-4`}
              >
                <IonSelect
                  onIonChange={(ev) => {
                    const value = ev.target.value;
                    setSelectedMessage(messages.find((m) => m.id === value));
                  }}
                  label="Selecionar mensagem"
                  labelPlacement="floating"
                >
                  {messages.map((message) => (
                    <IonSelectOption key={message.id} value={message.id}>
                      {message.title}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              {/* Controle de velocidade */}
              <IonItem
                lines="none"
                className={`rounded-lg border border-gray-300 mx-4 mb-4`}
              >
                <IonInput
                  step="0.1"
                  min="0.1"
                  onIonChange={(event) => {
                    const val = parseFloat(event.detail.value!);
                    if (!isNaN(val) && val > 0) {
                      setSpeed(val);
                    }
                  }}
                  type="number"
                  value={speed}
                  label="Velocidade (pixels/segundo)"
                  placeholder="Digite a velocidade"
                  labelPlacement="floating"
                />
              </IonItem>

              {/* Área do teleprompter */}
              <div className="px-4">
                <div
                  ref={promptRef}
                  className="mt-4 h-48 w-full max-w-md mx-auto overflow-hidden border p-4 bg-black text-white text-xl leading-relaxed rounded"
                  style={{ scrollBehavior: "auto" }}
                >
                  <div>{selectedMessage?.content}</div>
                </div>

                {/* Câmera */}
                <div className="w-full max-w-md mx-auto">
                  <video
                    ref={videoRef}
                    className="w-full rounded-md border"
                    playsInline
                    muted
                  ></video>
                </div>

                {/* Botões de gravação */}
                <IonButton
                  expand="block"
                  color={isRecording ? "danger" : "dark"}
                  className="mt-2"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? "Parar Gravação" : "Iniciar Gravação"}
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RecordMessagePage;
