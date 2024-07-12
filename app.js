const venom = require("venom-bot");

venom
  .create({
    session: "chatGPT_BOT", // Certifique-se de que o nome da sessão está correto
    multidevice: true, // Ativa o suporte a múltiplos dispositivos
    folderSession: "./sessions", // Define o caminho para armazenar dados de sessão
  })
  .then((client) => start(client))
  .catch((err) => console.error("Error during session creation:", err));

const header = {
  "Content-Type": "application/json",
  Authorization: "Bearer CHAVE-apiDOCHATGPT",
};

// Objeto para armazenar o estado (passo) de cada cliente
const clientState = {};

const start = (client) => {
  client.onMessage((message) => {
    const clientId = message.from;
    
    // Inicializa o estado do cliente se ainda não estiver definido
    if (!clientState[clientId]) {
      clientState[clientId] = 0;
    }

    switch (clientState[clientId]) {
      case 0:
        if (message.body != null) {
          client
            .sendText(
              message.from,
              "Sou um chatbot da BecCoders, o Sr(a) já é nosso cliente? Digite: Sim ou Não"
            )
            .then(() => {
              clientState[clientId] = 1;
            });
        }
        break;

      case 1:
        const normalizedMessage = message.body.toLowerCase();

        if (normalizedMessage === "sim") {
          client
            .sendText(
              message.from,
              "Ótimo, que bom vê-lo novamente! Vamos dar prosseguimento.\n" +
              "Sr(a) gostaria de solicitar:\n" +
              "1 - Novo Projeto,\n2 - Manutenção de software,\n3 - Outro serviço"
            )
            .then(() => {
              clientState[clientId] = 2;
            });
        } else if (normalizedMessage === "não" || normalizedMessage === "nao") {
          client
            .sendText(
              message.from,
              "Entendi, vamos dar prosseguimento.\n" +
              "Sr(a) gostaria de solicitar:\n" +
              "1 - Novo Projeto,\n2 - Manutenção de software,\n3 - Outro serviço"
            )
            .then(() => {
              clientState[clientId] = 2;
            });
        } else {
          client.sendText(
            message.from,
            "Não entendi. O Sr(a) já é nosso cliente? Digite: Sim ou Não"
          );
        }
        break;

      case 2:
        client
          .sendText(
            message.from,
            "Certo, estarei passando seu contato e sua demanda para o responsável técnico e logo estaremos entrando em contato. A BeCoders agradece o seu contato.\n" +
            "Tenha um bom dia."
          )
          .then(() => {
            clientState[clientId] = 0;
          });
        break;

      // Adicione mais casos conforme necessário

      default:
        break;
    }
  });
};
