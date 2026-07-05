const inputData = document.getElementById("data");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const btnAdicionar = document.getElementById("btnAdicionar");

inputData.value = dataHoje();

inputValor.addEventListener("input", function () {
    mascaraMoeda(this);
});

btnAdicionar.addEventListener("click", salvarDespesa);

async function salvarDespesa() {
    const data = inputData.value;
    const descricao = limparTexto(inputDescricao.value);
    const valor = converterValor(inputValor.value);

    if (!data) {
        mostrarMensagem("Informe a data.");
        return;
    }

    if (descricao === "") {
        mostrarMensagem("Informe a descrição.");
        inputDescricao.focus();
        return;
    }

    if (valor <= 0) {
        mostrarMensagem("Informe um valor válido.");
        inputValor.focus();
        return;
    }

    const idEdicao = btnAdicionar.dataset.editando;

    try {
        if (idEdicao) {
            await atualizarDespesaStorage(Number(idEdicao), {
                data, descricao, valor
            });
            btnAdicionar.textContent = "Adicionar";
            delete btnAdicionar.dataset.editando;
        } else {
            await adicionarDespesaStorage({
                data, descricao, valor
            });
        }

        limparFormulario();
        await atualizarTabela();
    } catch (err) {
        mostrarMensagem(err.message);
    }
}

function limparFormulario() {
    inputData.value = dataHoje();
    inputDescricao.value = "";
    inputValor.value = "";
    inputDescricao.focus();
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        salvarDespesa();
    }
});
