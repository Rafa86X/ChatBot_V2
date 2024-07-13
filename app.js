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


const lanches =  [
  { nome: "xis Salada", preco: "R$18,00" },
  { nome: "xis Bacon", preco: "R$22,00" },
  { nome: "xis Tudo", preco: "R$27,00" },
  { nome: "xis Frango", preco: "R$14,00" }
];

const lanche = () => {
  return lanches.map((lanche, index) => {
    return `${index + 1}. ${lanche.nome}: ${lanche.preco}`;
  }).join('\n');
}

const pedidoCliente = {};

const anotaPedido = (n,client) =>{
  if (!pedidoCliente[client]) {
    pedidoCliente[client] = []; 
  }
  pedidoCliente[client].push(n- 1); 
}

const mostraPedido = (client)=>{
  let num = pedidoCliente[client] 
  return  `${lanches[num].nome} ${lanches[pedidoCliente[client]].preco}`
}


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
            .sendText( message.from,
              "Sou um chatbot da RafaLanches, o Sr(a) gostaria de faze um pedido? Digite: Sim ou Não"
            ).then(() => { clientState[clientId] = 1; });
        }
        break;

      case 1:
        const normalizedMessage = message.body.toLowerCase();

        if (normalizedMessage === "sim") {
          client
            .sendText( message.from,
              "Ótimo, que bom vê-lo novamente! Vamos fazer assim.\n" +
              "Vamos esolher um lanche de cada vez, para sua lista de pedidos:\n"+
              lanche()
            ).then(() => { clientState[clientId] = 2; });

        } else if (normalizedMessage === "não" || normalizedMessage === "nao") {
          client
            .sendText( message.from,
              "Entendi,\n" +
              "que pena, volte sempre:\n"
            ).then(() => { clientState[clientId] = 0; });
            
        } else {
          client.sendText( message.from,
            "Não entendi. Sr(a) gostaria de faze um pedido? Digite: Sim ou Não"
          );
        }
        break;

      case 2:
        anotaPedido(message.body,clientId)
        client
          .sendText(
            message.from,
            "Certo, pedido anotado.\n"+
            mostraPedido(clientId)+"\n"+"\n"+
            "Para esse pedido deseja anotar alguma observação? como por exemplo, sem milho ou sem ovos etc?\n\n"+
            "Caso não, responda não."
          )
          .then(() => {  clientState[clientId] = 3; });
        break;

        case 3:
          client
            .sendText(
              message.from,
              "Certo, pedido anotado.\n"+
              mostraPedido(clientId),
              mostraPedido(clientId),
            )
            .then(() => {  clientState[clientId] = 3; });
          break;





        case 100:
          client
            .sendText( message.from,
              "Volte sempre!"
            ).then(() => { clientState[clientId] = 0; });
          break;
      
      default:
        break;
    }
  });
};
