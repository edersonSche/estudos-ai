import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Client } from 'pg';

dotenv.config();

const PROMPT_PRICE_INPUT = 0.1 / 1_000_000;
const PROMPT_PRICE_OUTPUT = 0.1 / 1_000_000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pgClient = new Client(process.env.DB_URL);

async function embedText(text) {
    const resp = await ai.models.embedContent({ 
        model: 'gemini-embedding-001',         
        contents: text,
        config: {
            outputDimensionality: 1536
        }
    });

    const result = resp.embeddings?.at(0);

    return { value: result?.values };
}

async function buildIndex(docs) {
    await pgClient.query('BEGIN');
    
    for (const doc of docs) {
        const embedding = await embedText(doc.content);
        const embeddingVector = `[${embedding.value.join(',')}]`;

        const sql = 'update documents set embedding = $1 where id = $2';
        await pgClient.query(sql, [embeddingVector, doc.id]);
    }

    await pgClient.query('COMMIT');

    console.log("Index built");
}

async function queryIndex(query, k = 3){
    const embedding = await embedText(query);
    const embeddingVector = `[${embedding.value.join(',')}]`;

    const result = await pgClient.query(
        `select *
         from(
            select id, content, metadata,
                1 - (embedding <=> $1) as score
            from documents
         )
         where score > 0.80
         order by score desc limit $2
        `,
        [embeddingVector, k]
    );

    return {
        rows: result.rows,
        cost: embedding.cost
    };
}

(async()=>{
    await pgClient.connect();
    const result  = await pgClient.query(`
        select id, content 
        from documents
        WHERE embedding IS NULL
    `);

    // construir índices/enbeddings
    if (result.rows && result.rowCount > 0) {
      await buildIndex(result.rows);
    }

    // consultar
    const question = "Como importar notas no módulo compras?";
    //const question = "Como posso saber se estou cadastrado no sistema?";
    const answers = await queryIndex(question, 3);

    await pgClient.end();

    const rules = `
        Você é um especialista no sistema e precisará responder as perguntas vindas dos usuários.
        Use apenas os trechos abaixo (marcados) para responder. Se não houver resposta, retorne "Informação não encontrada".
        Não criei nenhum conceito novo que fuja do conteúdo fornecido abaixo (marcados)
        Apenas devolva a resposta da pergunta efetuada pelo usuário
    `;

    const docs = answers.rows.map(item => `
        <doc${item.id}>
          ${item.content}
          Fonte (JSON): ${JSON.stringify(item.metadata)} 
        </doc${item.id}>
        `)

    const prompt = `
        ${rules}

        ${docs}

        Pergunta: "${question}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.7 },
    });

    const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = response.usageMetadata?.thoughtsTokenCount ?? 0;
    const promptCost = inputTokens * PROMPT_PRICE_INPUT + outputTokens * PROMPT_PRICE_OUTPUT;

    console.log("");
    console.log("---------------------------------");
    console.log("Question:", question);
    console.log("Answer:", response.text);
    console.log("Cost:", promptCost);
    console.log("Documents Used:", answers.rows.map(item => ({
        id: item.id,
        score: item.score
    })))
    console.log("---------------------------------");

})();