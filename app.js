const venom = require("venom-bot");

venom
  .create({
    session: "chatGPT_BOT", // Certifique-se de que o nome da sessão está correto
    multidevice: true, // Ativa o suporte a múltiplos dispositivos
    folderSession: "./sessions", // Define o caminho para armazenar dados de sessão
  })
  .then((client) => start(client))
  .catch((err) => console.error("Error during session creation:", err));


const clientState = {};

const itens = [
  { id: 1, nome: "xis Salada", preco: "R$18,00", tipo: "lanche" },
  { id: 2, nome: "xis Bacon", preco: "R$22,00", tipo: "lanche" },
  { id: 3, nome: "xis Tudo", preco: "R$27,00", tipo: "lanche" },
  { id: 4, nome: "xis Frango", preco: "R$14,00", tipo: "lanche" },
  { id: 5, nome: "Coca-Cola", preco: "R$6,00", tipo: "bebida" },
  { id: 6, nome: "Suco de Laranja", preco: "R$8,00", tipo: "bebida" }
];

const mostraItens = (tipo) => {
  return itens.filter(item => item.tipo === tipo).map((itemX) => {
    return `${itemX.id}. ${itemX.nome}: ${itemX.preco}`;
  }).join('\n');
}

const pedidoCliente = {};

const anotaPedido = (id, client) => {
  if (!pedidoCliente[client]) {
    pedidoCliente[client] = { itens: [], observacao: '' };
  }
  pedidoCliente[client].itens.push(id);
}

const mostraPedido = (client) => {
  let pedido = pedidoCliente[client];
  let itensPedido = pedido.itens.map(id => {
    const item = itens.find(item => item.id === id);
    return `${item.nome} ${item.preco}`;
  }).join('\n');

  let observacao = pedido.observacao ? `\nObservação: ${pedido.observacao}` : '';

  return `${itensPedido}${observacao}`;
}

const start = (client) => {
  client.onMessage((message) => {
    const clientId = message.from;
    let normalizedMessage = '';

    // Inicializa o estado do cliente se ainda não estiver definido
    if (!clientState[clientId]) {
      clientState[clientId] = 0;
    }

    if (clientState[clientId] === 0) {
      if (message.body != null) {
        client.sendText(message.from,
          "Sou um chatbot da RafaLanches, o Sr(a) gostaria de fazer um pedido? Digite: Sim ou Não"
        ).then(() => { clientState[clientId] = 1; });
      }
    } 
    
    if (clientState[clientId] === 1) {
      normalizedMessage = message.body.toLowerCase();

      if (normalizedMessage === "sim") {
        client.sendText(message.from,
          mostraItens("lanche")
        ).then(() => { clientState[clientId] = 2; });
      } else if (normalizedMessage === "não" || normalizedMessage === "nao") {
        client.sendText(message.from,
          "Entendi,\n" +
          "que pena, volte sempre:\n"
        ).then(() => { clientState[clientId] = 0; });
      } else {
        client.sendText(message.from,
          "Não entendi. Sr(a) gostaria de fazer um pedido? Digite: Sim ou Não"
        );
      }
    } 
    
    if (clientState[clientId] === 2) {
      anotaPedido(parseInt(message.body), clientId);
      client.sendText(message.from,
        "Certo, pedido anotado.\n\n" +
        mostraPedido(clientId) + "\n\n" +
        "Gostaria de pedir outro lanche?\n\n" +
        "-> Responda:\n" +
        " Sim - Adicionar outro lanche.\n" +
        " Não - Ir para Bebidas."
      ).then(() => { clientState[clientId] = 3; });
    } 
    
    if (clientState[clientId] === 3) {
      normalizedMessage = message.body.toLowerCase();
      if (normalizedMessage == 'sim') {
        client.sendText(message.from,
          mostraItens("lanche")
        ).then(() => { clientState[clientId] = 2; })
      } else if (normalizedMessage == 'não' || normalizedMessage == 'nao') {
        client.sendText(message.from,
          "Ok, vamos continuar com o pedido.\n"+
          mostraItens("bebida")
        ).then(() => { clientState[clientId] = 4; })
      }
    } 

    if (clientState[clientId] === 4) {
      anotaPedido(parseInt(message.body), clientId);
      client.sendText(message.from,
        "Certo, pedido anotado.\n\n" +
        mostraPedido(clientId) + "\n\n" +
        "Gostaria de adicionar outra bebida?\n\n" +
        "-> Responda:\n" +
        " Sim - Adicionar outra bebida.\n" +
        " Não - finalizar."
      ).then(() => { clientState[clientId] = 5; });
    } 
    
    if (clientState[clientId] === 5) {
      normalizedMessage = message.body.toLowerCase();
      if (normalizedMessage == 'sim') {
        client.sendText(message.from,
          mostraItens("bebida")
        ).then(() => { clientState[clientId] = 4; })
      } else if (normalizedMessage == 'não' || normalizedMessage == 'nao') {
        client.sendText(message.from,
          "Gostaria de adicionar alguma observação ao pedido?"
        ).then(() => { clientState[clientId] = 6; });
      }
    }

    if (clientState[clientId] === 6) {
      pedidoCliente[clientId].observacao = message.body;
      client.sendText(message.from,
        "Por favor, informe seu nome:"
      ).then(() => { clientState[clientId] = 7; });
    }

    if (clientState[clientId] === 7) {
      pedidoCliente[clientId].nome = message.body;
      client.sendText(message.from,
        "Por favor, informe seu endereço:"
      ).then(() => { clientState[clientId] = 8; });
    }

    if (clientState[clientId] === 8) {
      pedidoCliente[clientId].endereco = message.body;

      const nomeCliente = pedidoCliente[clientId].nome.split(' ')[0];
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toISOString().split('T')[0];
      const horaFormatada = `${dataAtual.getHours()}_${dataAtual.getMinutes()}`;
      const nomeArquivo = `chatbot-${dataFormatada}-${horaFormatada}-${nomeCliente}.txt`;
      const conteudoPedido = "Pedido finalizado! Aqui está o resumo do seu pedido:\n" +
        "Nome: " + pedidoCliente[clientId].nome + "\n" +
        "Endereço: " + pedidoCliente[clientId].endereco + "\n" +
        mostraPedido(clientId) +
        "\n\nVolte sempre!";

      fs.writeFileSync(nomeArquivo, conteudoPedido);

      client.sendText(message.from,
        conteudoPedido
      ).then(() => { clientState[clientId] = 0; });
    }
  });
};
