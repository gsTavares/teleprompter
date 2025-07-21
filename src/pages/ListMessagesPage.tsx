import { IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonPage, IonRow, IonText, useIonRouter, useIonToast, useIonViewDidEnter } from "@ionic/react";
import { pencil, trash } from "ionicons/icons";
import { useState } from "react";
import { deleteMessage, getMessages, MessageSchema } from "../services/database";

const ListMessagesPage: React.FC = () => {

  const [present] = useIonToast();
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [filter, setFilter] = useState<string>();
  const { push } = useIonRouter();

  useIonViewDidEnter(() => {
    const fetchMessages = async () => {
      const response = await getMessages();
      setMessages(response);
    }

    fetchMessages();
  });

  let filteredMessages = [...messages];

  if(filter) {
      filteredMessages = messages.filter(message => message.title.toLowerCase().includes(filter.toLowerCase()));
  }

  const handleDeleteMessage = async (message: MessageSchema) => {
    await deleteMessage(message.id!);
    
    setMessages(await getMessages());

    present({
      message: "Mensagem removida com sucesso!",
      duration: 1000
    });
  }

  const handleEditMessage = async (message: MessageSchema) => {
    push("/tab1?messageId=" + message.id);
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonText>
                <h1 className="ms-4">Suas mensagens</h1>
              </IonText>

              <IonItem lines="none" className={`rounded-lg border border-gray-300 mx-4 mb-4`}>
                <IonInput value={filter}
                  onIonInput={(event) => setFilter(event.detail.value as string)} type="text" label="Pesquisar" placeholder="Pesquisar"
                  labelPlacement="floating" />
              </IonItem>

              <main className="grid gap-4 px-4">
                {filteredMessages.map(message =>
                  <IonCard className="shadow-none border border-gray-200" key={message.id}>
                    <IonCardTitle className="px-4 pt-4">
                      {message.title}
                    </IonCardTitle>
                    <IonCardContent>
                      <footer className="flex gap-2">
                        <IonButton color="dark" onClick={() => handleEditMessage(message)}>
                          <IonIcon className="me-2" icon={pencil} />
                          Editar
                          </IonButton>
                        <IonButton color="danger" onClick={() => handleDeleteMessage(message)}>
                          <IonIcon className="me-2" icon={trash} />
                          Excluir
                          </IonButton>
                      </footer>
                    </IonCardContent>
                  </IonCard>
                )}
              </main>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ListMessagesPage;
