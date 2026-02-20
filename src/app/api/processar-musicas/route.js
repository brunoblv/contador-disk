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
    } else if (selecao === 'disk_mtv_crownnote') {
        top30 = calcularPontuacaoDiskMTVCrownnote(texto);
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
        .slice(0, 30);
}

function calcularPontuacaoDiskMTVCrownnote(texto) {
    // Tabela de pontuação Crownnote (posições 1 a 100)
    const pontuacaoCrownnote = [
        10000, 7072, 5774, 5000, 4472, 4082, 3780, 3536, 3333, 3162,
        3015, 2887, 2774, 2673, 2582, 2500, 2425, 2357, 2294, 2236,
        2182, 2132, 2085, 2041, 2000, 1962, 1925, 1890, 1857, 1826,
        1796, 1768, 1741, 1715, 1690, 1667, 1644, 1622, 1601, 1581,
        1562, 1543, 1525, 1508, 1491, 1474, 1459, 1443, 1429, 1414,
        1400, 1387, 1374, 1361, 1348, 1336, 1325, 1313, 1302, 1291,
        1280, 1270, 1260, 1250, 1240, 1231, 1222, 1213, 1204, 1195,
        1186, 1179, 1170, 1162, 1155, 1147, 1140, 1132, 1125, 1118,
        1111, 1104, 1098, 1091, 1085, 1078, 1072, 1066, 1060, 1054,
        1048, 1043, 1037, 1031, 1026, 1021, 1015, 1010, 1005, 1000
    ];

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

        // Usa a tabela Crownnote: posição 1 = índice 0, posição 100 = índice 99
        // Se a posição for maior que 100, usa a pontuação da posição 100
        const indicePontuacao = Math.min(posicaoAtual - 1, 99);
        const pontos = pontuacaoCrownnote[indicePontuacao] || 0;

        const chave = `${artista.trim()} - ${musica.trim()}`;

        if (pontuacaoMusicas.has(chave)) {
            pontuacaoMusicas.set(chave, pontuacaoMusicas.get(chave) + pontos);
        } else {
            pontuacaoMusicas.set(chave, pontos);
        }
    });

    return Array.from(pontuacaoMusicas.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
}

function calcularPontuacaoPush(texto) {
    const scores = {};
    const maxPoints = 20;

    texto.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        try {
            const [positionStr, ...rest] = trimmedLine.split(' ');
            if (!positionStr || rest.length === 0) {
                console.log(`Entrada inválida: ${trimmedLine}`);
                return;
            }

            const position = parseInt(positionStr.replace('#', ''));
            const key = rest.join(' ').trim();

            const points = Math.max(0, maxPoints - (position - 1));

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
        .slice(0, 100);
}