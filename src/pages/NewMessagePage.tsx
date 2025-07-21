import { IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonPage, IonRow, IonText, IonTextarea, useIonToast } from "@ionic/react";
import { FormEvent, useRef, useState } from "react";
import { addMessage } from "../services/database";

const NewMessagePage: React.FC = () => {

  // ion toast
  const [present] = useIonToast();

  // inputs
  const titleRef = useRef<HTMLIonInputElement>(null);
  const contentRef = useRef<HTMLIonTextareaElement>(null);

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
        duration: 3000
      });

      setTitleInvalid(true);
      return;
    }

    setTitleInvalid(false);

    if (!contentValue || contentValue === '') {
      present({
        message: "Por favor, preencha o conteúdo da mensagem",
        duration: 3000
      });

      setContentInvalid(true);
      return;
    }

    setContentInvalid(false);

    await addMessage({
      title: titleValue,
      content: contentValue
    });

    present({
      message: "Mensagem cadastrada com sucesso!"
    })

    titleRef.current!.value = null;
    contentRef.current!.value = null;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonText>
                <h1 className="ms-4">Nova mensagem</h1>
              </IonText>
              <form className="flex flex-col px-4 gap-4" onSubmit={handleCreateMessage}>
                <IonItem lines="none" className={`rounded-lg border border-gray-300 ${titleInvalid ? 'border-red-500' : undefined}`}>
                  <IonInput ref={titleRef} type="text"  label="Título"
                    labelPlacement="floating"
                    placeholder="Digite um título para a mensagem" />
                </IonItem>

                <IonItem lines="none" className={`rounded-lg border border-gray-300 ${contentInvalid ? 'border-red-500' : undefined}`}>
                  <IonTextarea ref={contentRef} autoGrow rows={10} label="Conteúdo"
                    labelPlacement="floating"
                    placeholder="Digite o conteúdo da mensagem" />
                </IonItem>

                <IonButton type="submit" className="self-end justify-self-end w-max" expand="block">Salvar</IonButton>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NewMessagePage;
