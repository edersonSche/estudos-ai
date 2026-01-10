import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function dot(a, b) { 
    return a.reduce((s, v, i) => s + v * b[i], 0); 
}

function norm(a) { 
    return Math.sqrt(dot(a,a)); 
}

function cosine(a,b) {
    return dot(a,b) / (norm(a)*norm(b) + 1e-12); 
}

async function embedText(text) {
    const resp = await ai.models.embedContent({ 
        model: 'gemini-embedding-001',         
        contents: text
    });

    return resp.embeddings?.at(0).values;
}

async function buildIndex(docs, outFile = "index.jsonl") {
    const stream = fs.createWriteStream(outFile, { flags: "w" });
    for (const doc of docs) {
        const embedding = await embedText(doc.text);

        stream.write(JSON.stringify({
            id: doc.id,
            text: doc.text,
            embedding
        }) + "\n");
    }

    stream.close();
    console.log("Index built:", outFile);
}

function loadIndex(path = "index.jsonl"){
  return fs.readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .map(line => JSON.parse(line));
}

async function queryIndex(query, k=3, path="index.jsonl"){
    const qVec = await embedText(query);
    const idx = loadIndex(path);
    const scored = idx.map(item => ({ 
        id: item.id, 
        text: item.text, 
        score: cosine(qVec, item.embedding) 
    }));
    scored.sort((a,b) => b.score - a.score);
    return scored.slice(0,k);
}

//exemplo de uso

(async()=>{
    const docs = [
        { id: "d1", text: "Guia de instalação do módulo compras: passo 1… passo 2…" },
        { id: "d2", text: "Como importar notas fiscais no sistema: menu > compras > import." },
        { id: "d3", text: "Erros comuns ao importar notas: formato CSV incorreto, campos faltando." },
        { id: "d4", text: "Configuração inicial de fornecedores: acesse cadastro > fornecedores > novo cadastro." },
        { id: "d5", text: "Como gerar um pedido de compra: selecione o fornecedor, adicione itens e confirme o pedido." },
        { id: "d6", text: "Procedimento para atualização de preços: menu > compras > tabelas > atualizar preços." },
        { id: "d7", text: "Relatório de compras: filtros por período, fornecedor e centro de custo." },
        { id: "d8", text: "Como cancelar uma nota fiscal importada: abra a nota, clique em 'ações' e selecione 'cancelar'." },
        { id: "d9", text: "Integração com sistemas externos: habilite a API, configure token e URL de origem." },
        { id: "d10", text: "Rotina de conciliação de pedidos: verifique divergências entre pedido, nota e recebimento físico." },
        { id: "d11", text: "Como configurar impostos na importação: vá em configurações fiscais e selecione o perfil tributário." },
        { id: "d12", text: "Permissões de usuários no módulo de compras: definir acesso a criação, edição e exclusão de documentos." }
    ];

    // construir índice (somente na primeira vez)
    const file = "index.jsonl";
    await buildIndex(docs, file);

    // consultar
    const question = "Como importar notas no módulo compras?";
    const res = await queryIndex(question, 3, file);


    console.log("");
    console.log("---------------------------------");
    console.log("Question:", question);
    console.log("Top results:", res);
    console.log("---------------------------------");

    //após isto podemos pegar a pergunta efetuada, o conteúdo encontrado 
    // (limitando por um percentual acima de 80%) e com isto montar um promtp
    // para enviar a uma LLM e assim termos uma resposta mais "humanizada"
    //exemplo:
    /*
    Use apenas os trechos abaixo (marcados) para responder. Se não houver resposta, retorne "Informação não encontrada".

    <doc1>
    {texto do chunk 1}
    Fonte: {metadata}
    </doc1>

    ...

    Pergunta: {pergunta do usuário}
    */
})();