function calcularPontuacao(texto) {
    const pontuacaoMusicas = new Map(); // Usamos um Map para armazenar as pontuações

    // Regex para remover qualquer número ou texto extra no final das linhas
    const regexExtra = /\s+\d+\(×\d+\)\s+\d+|\s+\d+\s+\d+/;

    // Divide o texto em linhas
    const linhas = texto.split('\n');

    // Processa cada linha
    linhas.forEach((linha) => {
        // Remove espaços em branco ao redor e ignora linhas vazias
        const linhaLimpa = linha.trim();
        if (!linhaLimpa) return;

        // Divide a linha no símbolo "–" para isolar o nome da música
        const partes = linhaLimpa.split("–");
        if (partes.length < 2) return; // Pula linhas que não estão no formato esperado

        // Captura a parte antes do "–" (artista e outros detalhes)
        const dadosIniciais = partes[0].trim().split(/\s+/);

        // Captura a parte da música, removendo qualquer texto extra no final (como números)
        const musica = partes[1].replace(regexExtra, '').trim();

        // Verifica se a linha tem pelo menos 3 colunas e se a segunda coluna é uma posição numérica
        if (dadosIniciais.length < 3 || !/^\d+$/.test(dadosIniciais[1])) {
            return; // Pula linhas inválidas ou com dropouts
        }

        // A posição da música é o segundo valor
        const posicaoAtual = parseInt(dadosIniciais[1], 10);

        // O nome do artista vai da terceira posição até o fim antes do "–"
        const artista = dadosIniciais.slice(2).join(' ');

        // Pontuação é calculada pela posição (101 - posição)
        const pontos = 101 - posicaoAtual;

        // Chave é a combinação do artista e da música, sem os números extras
        const chave = `${artista.trim()} - ${musica.trim()}`;

        // Soma a pontuação no Map
        if (pontuacaoMusicas.has(chave)) {
            pontuacaoMusicas.set(chave, pontuacaoMusicas.get(chave) + pontos);
        } else {
            pontuacaoMusicas.set(chave, pontos);
        }
    });

    // Ordena as músicas por pontuação, do maior para o menor
    const top30 = Array.from(pontuacaoMusicas.entries())
        .sort((a, b) => b[1] - a[1]) // Ordena por pontuação decrescente
        .slice(0, 30); // Pega as 30 primeiras

    return top30;
}

// Exemplo de uso
const texto = `
1 – Artista A – Música X 1(×2) 3
2 – Artista B – Música Y 2(×1) 4
3 – Artista C – Música Z 3(×3) 5
`;

const resultado = calcularPontuacao(texto);
console.log("Top 30 músicas que mais pontuaram:");
resultado.forEach(([musica, pontos], index) => {
    console.log(`${index + 1}. ${musica} - ${pontos} pontos`);
});