import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow, IonText, IonTextarea, useIonRouter, useIonToast } from "@ionic/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { addMessage, getMessageById, MessageSchema, updateMessage } from "../services/database";

const NewMessagePage = () => {

  const location = useLocation();

  const { push } = useIonRouter();

  // inputs
  const titleRef = useRef<HTMLIonInputElement>(null);
  const contentRef = useRef<HTMLIonTextareaElement>(null);

  const [selectedMessage, setSelectedMessage] = useState<MessageSchema>();

  useEffect(() => {
    const messageId = location.search.split("=")[1];

    const fetchMessage = async (id: string) => {
      return await getMessageById(Number(id));
    }

    if (messageId) {
      fetchMessage(messageId).then(message => {
        setSelectedMessage(message);
      })
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedMessage) {
      if (titleRef.current) {
        titleRef.current.value = selectedMessage.title;
      }
      if (contentRef.current) {
        contentRef.current.value = selectedMessage.content;
      }
    } else {
      if (titleRef.current) {
        titleRef.current.value = null;
      }
      if (contentRef.current) {
        contentRef.current.value = null;
      }
    }
  }, [selectedMessage]);

  // ion toast
  const [present] = useIonToast();


  // validations
  const [titleInvalid, setTitleInvalid] = useState(false);
  const [contentInvalid, setContentInvalid] = useState(false);



  const handleCreateMessage = async (event: FormEvent) => {
    event.preventDefault();

    const titleValue = titleRef.current?.value as string;
    const contentValue = contentRef.current?.value;

    if (!titleValue || titleValue === '') {
      present({
        message: "Por favor, preencha o título da mensagem",
        duration: 1000
      });

      setTitleInvalid(true);
      return;
    }

    setTitleInvalid(false);

    if (!contentValue || contentValue === '') {
      present({
        message: "Por favor, preencha o conteúdo da mensagem",
        duration: 1000
      });

      setContentInvalid(true);
      return;
    }

    setContentInvalid(false);

    if (selectedMessage) {
      await updateMessage({
        title: titleValue,
        content: contentValue,
        id: selectedMessage.id
      })
    } else {
      await addMessage({
        title: titleValue,
        content: contentValue
      });
    }

    present({
      message: "Mensagem cadastrada com sucesso!",
      duration: 1000
    })

    titleRef.current!.value = null;
    contentRef.current!.value = null;
  }

  const handleCancelMessage = () => {
    push("/tab1");
    setSelectedMessage(undefined);
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonText>
                <h1 className="ms-4">{selectedMessage ? 'Editar mensagem' : 'Nova mensagem'}</h1>
              </IonText>
              <form className="flex flex-col px-4 gap-4" onSubmit={handleCreateMessage}>
                <IonItem lines="none" className={`rounded-lg border border-gray-300 ${titleInvalid ? 'border-red-500' : undefined}`}>
                  <IonInput ref={titleRef} type="text" label="Título"
                    labelPlacement="floating"
                    placeholder="Digite um título para a mensagem" />
                </IonItem>

                <IonItem lines="none" className={`rounded-lg border border-gray-300 ${contentInvalid ? 'border-red-500' : undefined}`}>
                  <IonTextarea ref={contentRef} autoGrow rows={10} label="Conteúdo"
                    labelPlacement="floating"
                    placeholder="Digite o conteúdo da mensagem" />
                </IonItem>

                <footer className="flex gap-2 justify-self-end">
                  {selectedMessage &&
                    <IonButton onClick={handleCancelMessage} color="danger" className="ms-auto">
                      Cancelar
                    </IonButton>
                  }
                  <IonButton type="submit" color="dark" className={`${!selectedMessage ? 'ms-auto' : undefined} self-end w-max`} expand="block">Salvar</IonButton>
                </footer>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NewMessagePage;
