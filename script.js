
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
        alert("Não encontrei os campos de login. Verifique o index.html.");
        return;
    }

    const usuario = campoUsuario.value.trim();
    const senha = campoSenha.value;

    const usuarioSalvo = localStorage.getItem("usuario");
    const senhaSalva = localStorage.getItem("senha");

    if (!usuarioSalvo || !senhaSalva) {
        alert("Faça seu cadastro antes de entrar.");
        return;
    }

    if (usuario === usuarioSalvo && senha === senhaSalva) {
        window.location.href = "./home.html";
    } else {
        alert("Usuário ou senha incorretos.");
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

        if (campo) {
            campo.value += texto;
        }
    };

    recognition.onerror = function (event) {
        console.error("Erro na transcrição:", event.error);

        if (event.error === "not-allowed") {
            alert("Permita o uso do microfone nas configurações do navegador.");
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
        alert("Não foi possível iniciar a transcrição. Tente novamente.");
    }
}

function pararGravacao() {
    if (recognition && gravando) {
        recognition.stop();
    }
}

// AGENTE BLUE — RESUMO COM IA
async function gerarResumo() {
    const campo = document.getElementById("textoAula");
    const resultado = document.getElementById("resultado");

    if (!campo || !resultado) {
        alert("Não encontrei a área de texto ou de resultado no home.html.");
        return;
    }

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
                        "Resuma este conteúdo de aula em português brasileiro. Organize o resumo com título, conceitos principais e explicações simples:\n\n" +
                        texto
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.details ||
                dados.error ||
                "O servidor recusou a solicitação."
            );
        }

        if (!dados.answer) {
            throw new Error("A IA não retornou um resumo.");
        }

        const titulo = document.createElement("h3");
        titulo.textContent = "🤖 Agente BLUE — Resumo inteligente";

        const paragrafo = document.createElement("p");
        paragrafo.textContent = dados.answer;

        resultado.replaceChildren(titulo, paragrafo);

    } catch (erro) {
        console.error("Erro no Agente BLUE:", erro);

        resultado.textContent =
            "Não foi possível gerar o resumo: " + erro.message;
    }
}

// EVITAR CÓDIGO HTML INDESEJADO NO MAPA
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

// MAPA MENTAL
function gerarMapa() {
    const campo = document.getElementById("textoAula");
    const resultado = document.getElementById("resultado");

    if (!campo || !resultado) return;

    const texto = campo.value.trim();

    if (!texto) {
        alert("Digite ou transcreva o conteúdo da aula primeiro.");
        return;
    }

    const frases = texto
        .split(/[.!?\n]+/)
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
    resultado.innerHTML = html;
}

// EXPORTAR PDF
function gerarPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("A biblioteca de PDF não carregou. Verifique sua conexão.");
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
    doc.text("BLUE - Resumo da aula", 10, 15);

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

    doc.save("Resumo_BLUE.pdf");
}
