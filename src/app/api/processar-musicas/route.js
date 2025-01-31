// src/app/api/processar-musicas/route.js
export async function POST(request) {
    const { texto } = await request.json();

    if (!texto) {
        return new Response(JSON.stringify({ error: 'Nenhum texto enviado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

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

    const top30 = Array.from(pontuacaoMusicas.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 200);

    return new Response(JSON.stringify({ musicas: top30 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}