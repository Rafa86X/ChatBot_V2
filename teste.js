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
  
  console.log(lanche());
