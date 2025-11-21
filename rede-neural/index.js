const tf = require('@tensorflow/tfjs');

async function main() {
  // 1) Dados de treino (x → y)
  const xs = tf.tensor([1, 2, 3, 4]);
  const ys = tf.tensor([1, 3, 5, 7]);

  // 2) Criar o modelo sequencial
  const model = tf.sequential();

  // 3) Adicionar uma camada densa (fully-connected)
  model.add(tf.layers.dense({
    units: 1,       // um neurônio
    inputShape: [1] // recebe 1 número por vez
  }));

  // 4) Compilar o modelo
  model.compile({
    loss: 'meanSquaredError',
    optimizer: 'sgd'
  });

  console.log("Treinando a rede...");

  // 5) Treinar o modelo
  await model.fit(xs, ys, {
    epochs: 200,
    validationSplit: 0.2,   // 20% dos dados viram validação
    shuffle: true
  });

  
  //console.log("Histórico do treino:");
  //console.log(model.history.history);

  // 6) Fazer uma inferência
  //const output = model.predict(tf.tensor([10]));
  //output.print(); // deve dar ~19

  const teste = tf.tensor([15, 20, 100]);
  const result = model.predict(teste);
  result.print();
}

main();
