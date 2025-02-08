// src/app/api/processar-musicas/route.js
export async function POST(request) {
    const { texto, selecao } = await request.json();

    if (!texto) {
        return new Response(JSON.stringify({ error: 'Nenhum texto enviado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let top30;
    if (selecao === 'push') {
        top30 = calcularPontuacaoPush(texto);
    } else {
        top30 = calcularPontuacaoDiskMTV(texto);
    }

    return new Response(JSON.stringify({ musicas: top30 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

function calcularPontuacaoDiskMTV(texto) {
    const pontuacaoMusicas = new Map();
    const regexExtra = /\s+\d+\(×\d+\)\s+\d+|\s+\d+\s+\d+/;

    texto.split('\n').forEach((linha) => {
        const linhaLimpa = linha.trim();
        if (!linhaLimpa) return;

        const partes = linhaLimpa.split("–");
        if (partes.length < 2) return;

        const dadosIniciais = partes[0].trim().split(/\s+/);
        const musica = partes[1].replace(regexExtra, '').trim();

        if (dadosIniciais.length < 3 || !/^\d+$/.test(dadosIniciais[1])) return;

        const posicaoAtual = parseInt(dadosIniciais[1], 10);
        const artista = dadosIniciais.slice(2).join(' ');
        const pontos = 101 - posicaoAtual;
        const chave = `${artista.trim()} - ${musica.trim()}`;

        if (pontuacaoMusicas.has(chave)) {
            pontuacaoMusicas.set(chave, pontuacaoMusicas.get(chave) + pontos);
        } else {
            pontuacaoMusicas.set(chave, pontos);
        }
    });

    return Array.from(pontuacaoMusicas.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 200);
}

function calcularPontuacaoPush(texto) {
    const scores = {};
    const maxPoints = 20;

    texto.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        try {
            const [positionStr, rest] = trimmedLine.split(' ', 2);
            const position = parseInt(positionStr.substring(1));

            const [artist, song] = rest.split(' - ', 2);

            const points = Math.max(0, maxPoints - (position - 1));

            const key = `${artist} - ${song}`;
            if (scores[key]) {
                scores[key] += points;
            } else {
                scores[key] = points;
            }
        } catch {
            console.log(`Entrada inválida: ${trimmedLine}`);
        }
    });

    return Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
}