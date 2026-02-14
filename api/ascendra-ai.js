export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { type, userData, message } = req.body;

    const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

    if (!HF_TOKEN) {
      return res.status(500).json({ error: "Token não configurado" });
    }

    let prompt = "";

    switch (type) {

      case "mentor":
        prompt = `
Você é o Mentor Supremo do ASCENDRA, um RPG de evolução pessoal.

Dados do jogador:
Nível: ${userData?.level}
XP: ${userData?.xp}
Streak: ${userData?.streak}
Perfil: ${userData?.profile}

Mensagem do jogador:
${message}

Responda de forma estratégica, motivadora e prática.
`;
        break;

      case "generate_mission":
        prompt = `
Baseado nesses dados:

Nível: ${userData?.level}
Área fraca: ${userData?.weakArea}
Taxa de conclusão: ${userData?.completionRate}

Gere:
- 1 missão fácil
- 1 missão média
- 1 missão difícil

Seja direto e prático.
`;
        break;

      case "analyze_profile":
        prompt = `
Analise o padrão do jogador:

Taxa de conclusão: ${userData?.completionRate}
Frequência semanal: ${userData?.weeklyFrequency}
Área forte: ${userData?.strongArea}
Área fraca: ${userData?.weakArea}

Classifique em um dos perfis:
- Guerreiro Disciplinado
- Estrategista Mental
- Explosivo Inconsistente
- Sonhador Procrastinador
- Persistente Resiliente

Explique brevemente.
`;
        break;

      default:
        return res.status(400).json({ error: "Tipo inválido" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    const result = await response.json();

    if (!result || !result[0]) {
      return res.status(500).json({ error: "Erro ao gerar resposta da IA" });
    }

    return res.status(200).json({
      result: result[0].generated_text,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno na IA" });
  }
}
