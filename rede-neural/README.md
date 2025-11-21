# Rede Neural — Exercício com TensorFlow.js

Projeto de exemplo para entender redes neurais simples usando TensorFlow.js. O objetivo foi treinar um modelo para aprender a relação linear entre entradas e saídas a partir de poucos exemplos.

- Código principal: [index.js](index.js) (função [`main`](index.js))
- Dependências: [package.json](package.json)

## O que o projeto faz

1. Cria tensores de treino: as entradas [`xs`](index.js) e saídas [`ys`](index.js).
2. Cria um modelo sequencial simples [`model`](index.js) com uma camada densa (1 neurônio).
3. Compila o modelo com perda MSE e otimizador SGD.
4. Treina por 200 epochs (com 20% dos dados usados para validação).
5. Faz previsões para entradas de teste.

O modelo aprende uma função linear do tipo $y = ax + b$. A função de perda usada é a média dos erros quadráticos:
$$
L = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2
$$

## Como rodar

1. Instalar dependências:
```sh
npm install
```
2. Executar:
```sh
npm start
```
