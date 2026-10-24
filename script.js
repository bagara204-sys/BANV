
function cadastro() {
    const usuario = prompt("Crie seu usuário:");
    if (!usuario) return;

    const senha = prompt("Crie sua senha:");
    if (!senha) return;

    localStorage.setItem("usuario", usuario);
    localStorage.setItem("senha", senha);

    alert("Cadastro realizado!");
}

function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (
        usuario === localStorage.getItem("usuario") &&
        senha === localStorage.getItem("senha")
    ) {
        window.location.href = "home.html";
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

function logout() {
    window.location.href = "index.html";
}

// GRAVAÇÃO E TRANSCRIÇÃO
let recognition = null;
let gravando = false;

function iniciarGravacao() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome.");
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
        campo.value += texto;
    };

    recognition.onerror = function (event) {
        console.error("Erro no reconhecimento:", event.error);

        if (event.error === "not-allowed") {
            alert("Permita o uso do microfone nas configurações do navegador.");
        } else if (event.error !== "no-speech") {
            alert("Ocorreu um erro na transcrição: " + event.error);
        }
    };

    recognition.onend = function () {
        gravando = false;
    };

    try {
        recognition.start();
    } catch (erro) {
        alert("Não foi possível iniciar. Tente novamente.");
    }
}

function pararGravacao() {
    if (recognition && gravando) {
        recognition.stop();
    }
}

// AGENTE BLUE


async function gerarResumo() {
    const campo = document.getElementById("textoAula");
    const resultado = document.getElementById("resultado");
    const texto = campo.value.trim();

    if (!texto) {
        alert("Digite ou transcreva o conteúdo da aula primeiro.");
        return;
    }

    resultado.textContent = "🤖 O Agente BLUE está analisando sua aula...";

    try {
        const resposta = await fetch(
            "https://baby.bagara204.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message:
                        "Faça um resumo claro e organizado deste conteúdo de aula em português brasileiro. Destaque os conceitos principais:\n\n" +
                        texto
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.details || dados.error ||
                "Erro ao solicitar o resumo."
            );
        }

        const titulo = document.createElement("h3");
        titulo.textContent = "🤖 Agente BLUE — Resumo inteligente";

        const paragrafo = document.createElement("p");
        paragrafo.textContent = dados.answer ||
            "Não foi possível gerar o resumo.";

        resultado.replaceChildren(titulo, paragrafo);

    
} catch (erro) {
    console.error("Erro no Agente BLUE:", erro);

    resultado.textContent =
        "Erro na conexão: " + erro.message;
}

        resultado.textContent =
            "Não foi possível conectar à IA. Verifique o Worker e tente novamente.";
    }
}



// MAPA MENTAL
function gerarMapa() {
    const texto = document.getElementById("textoAula").value.trim();

    if (!texto) {
        alert("Digite ou transcreva o conteúdo da aula primeiro.");
        return;
    }

    const frases = texto
        .split(/[.!?]+/)
        .map(frase => frase.trim())
        .filter(Boolean);

    let html = `
        <h3>🧠 Mapa Mental</h3>
        <div class="mindmap">
            <div class="centro">Tema principal</div>
    `;

    frases.forEach(frase => {
        html += `
            <div class="ramo">
                <span>➜</span>
                <div class="caixa">${escaparHTML(frase)}</div>
            </div>
        `;
    });

    html += "</div>";

    document.getElementById("resultado").innerHTML = html;
}

// EXPORTAR PDF
function gerarPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("A biblioteca de PDF não carregou. Verifique sua conexão.");
        return;
    }

    const resultado = document.getElementById("resultado").innerText.trim();

    if (!resultado) {
        alert("Gere um resumo ou mapa mental antes de baixar o PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("BLUE - Resumo da aula", 10, 15);

    doc.setFontSize(11);

    const linhas = doc.splitTextToSize(resultado, 180);
    let y = 25;

    linhas.forEach(linha => {
        if (y > 280) {
            doc.addPage();
            y = 15;
        }

        doc.text(linha, 10, y);
        y += 7;
    });

    doc.save("Resumo_BLUE.pdf");
}
