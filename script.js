
function cadastro() {
    const usuario = prompt("Crie seu usuário:");
    if (!usuario || !usuario.trim()) return;

    const senha = prompt("Crie sua senha:");
    if (!senha) return;

    localStorage.setItem("usuario", usuario.trim());
    localStorage.setItem("senha", senha);

    alert("Cadastro realizado! Agora você pode entrar.");
}

function login() {
    const campoUsuario = document.getElementById("usuario");
    const campoSenha = document.getElementById("senha");

    if (!campoUsuario || !campoSenha) {
        alert("Não encontrei os campos de login.");
        return;
    }

    const usuario = campoUsuario.value.trim();
    const senha = campoSenha.value;

    if (
        usuario === localStorage.getItem("usuario") &&
        senha === localStorage.getItem("senha") &&
        usuario !== ""
    ) {
        window.location.href = "./home.html";
    } else {
        alert("Usuário ou senha incorretos. Se ainda não tem cadastro, cadastre-se primeiro.");
    }
}

function logout() {
    window.location.href = "./index.html";
}

// GRAVAÇÃO E TRANSCRIÇÃO
let recognition = null;
let gravando = false;

function iniciarGravacao() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Use o Google Chrome para tentar transcrever a aula.");
        return;
    }

    if (gravando) return;

    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = function () {
        gravando = true;
        alert("Transcrição iniciada!");
    };

    recognition.onresult = function (event) {
        let texto = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                texto += event.results[i][0].transcript + " ";
            }
        }

        const campo = document.getElementById("textoAula");
        if (campo) campo.value += texto;
    };

    recognition.onerror = function (event) {
        console.error("Erro na transcrição:", event.error);

        if (event.error === "not-allowed") {
            alert("Permita o acesso ao microfone.");
        } else if (event.error !== "no-speech") {
            alert("Erro na transcrição: " + event.error);
        }
    };

    recognition.onend = function () {
        gravando = false;
    };

    try {
        recognition.start();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível iniciar. Tente novamente.");
    }
}

function pararGravacao() {
    if (recognition && gravando) {
        recognition.stop();
    }
}

// AGENTE BLUE — IA PELO PUTER.JS
async function consultarIA(instrucoes) {
    if (!window.puter || !window.puter.ai) {
        throw new Error(
            "O Puter.js não carregou. Confira a conexão com a internet e a inclusão da biblioteca no home.html."
        );
    }

    const resposta = await window.puter.ai.chat(instrucoes);

    if (typeof resposta === "string") {
        return resposta;
    }

    const texto =
        resposta?.message?.content ??
        resposta?.text;

    if (typeof texto === "string") {
        return texto;
    }

    if (Array.isArray(texto)) {
        return texto
            .map(item => item.text || "")
            .join("\n");
    }

    throw new Error("A IA não retornou um texto válido.");
}

// GERAR RESUMO COM IA
async function gerarResumo() {
    const campo = document.getElementById("textoAula");
    const resultado = document.getElementById("resultado");

    if (!campo || !resultado) return;

    const texto = campo.value.trim();

    if (!texto) {
        alert("Digite ou transcreva o conteúdo da aula primeiro.");
        return;
    }

    resultado.textContent = "🤖 O BLUE está preparando seu resumo...";

    try {
        const resumo = await consultarIA(
            "Você é o assistente educacional BLUE. " +
            "Responda em português brasileiro. " +
            "Resuma o conteúdo da aula com um título, conceitos principais, " +
            "explicações simples e uma conclusão. Não invente informações.\n\n" +
            "CONTEÚDO DA AULA:\n" + texto
        );

        const titulo = document.createElement("h3");
        titulo.textContent = "🤖 BLUE — Resumo inteligente";

        const paragrafo = document.createElement("p");
        paragrafo.style.whiteSpace = "pre-wrap";
        paragrafo.textContent = resumo;

        resultado.replaceChildren(titulo, paragrafo);

    } catch (erro) {
        console.error("Erro ao gerar resumo:", erro);

        resultado.textContent =
            "Não foi possível gerar o resumo: " + erro.message;
    }
}

// EVITAR HTML INDESEJADO
function escaparHTML(texto) {
    return texto.replace(/[&<>"']/g, function (caractere) {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caractere];
    });
}

// MAPA MENTAL COM IA
async function gerarMapa() {
    const campo = document.getElementById("textoAula");
    const resultado = document.getElementById("resultado");

    if (!campo || !resultado) return;

    const texto = campo.value.trim();

    if (!texto) {
        alert("Digite ou transcreva o conteúdo da aula primeiro.");
        return;
    }

    resultado.textContent = "🧠 O BLUE está criando seu mapa mental...";

    try {
        const resposta = await consultarIA(
            "Você é o assistente educacional BLUE. " +
            "Crie um mapa mental em português brasileiro a partir da aula. " +
            "Escreva o TEMA PRINCIPAL na primeira linha. " +
            "Depois, liste de 4 a 8 conceitos importantes, um por linha, " +
            "com uma explicação curta para cada um. " +
            "Não use Markdown complexo.\n\n" +
            "CONTEÚDO DA AULA:\n" + texto
        );

        const titulo = document.createElement("h3");
        titulo.textContent = "🧠 Mapa Mental — BLUE";

        const mapa = document.createElement("div");
        mapa.className = "mindmap";
        mapa.style.display = "flex";
        mapa.style.flexDirection = "column";
        mapa.style.gap = "12px";

        resposta.split("\n").filter(linha => linha.trim()).forEach(linha => {
            const caixa = document.createElement("div");
            caixa.className = "caixa";
            caixa.style.padding = "12px";
            caixa.style.borderRadius = "10px";
            caixa.style.whiteSpace = "pre-wrap";
            caixa.textContent = linha.replace(/^[-*•#>\s]+/, "");
            mapa.appendChild(caixa);
        });

        resultado.replaceChildren(titulo, mapa);

    } catch (erro) {
        console.error("Erro ao criar mapa mental:", erro);

        resultado.textContent =
            "Não foi possível criar o mapa mental: " + erro.message;
    }
}

// EXPORTAR PDF
function gerarPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("A biblioteca de PDF não carregou. Verifique a conexão.");
        return;
    }

    const resultado = document.getElementById("resultado");
    const texto = resultado ? resultado.innerText.trim() : "";

    if (!texto) {
        alert("Gere um resumo ou mapa mental antes de baixar o PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("BLUE - Material de estudo", 10, 15);

    doc.setFontSize(11);

    const linhas = doc.splitTextToSize(texto, 180);
    let y = 25;

    linhas.forEach(linha => {
        if (y > 280) {
            doc.addPage();
            y = 15;
        }

        doc.text(linha, 10, y);
        y += 7;
    });

    doc.save("Material_BLUE.pdf");
}
