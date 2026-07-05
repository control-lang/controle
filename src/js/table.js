const tbody = document.getElementById("tbody");
const totalGeral = document.getElementById("totalGeral");

async function atualizarTabela() {
    tbody.innerHTML = "";

    try {
        const despesas = await buscarDespesas();

        if (despesas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;padding:20px;">
                        Nenhuma despesa cadastrada.
                    </td>
                </tr>
            `;
            await atualizarTotal();
            return;
        }

        despesas.forEach(despesa => {
            adicionarLinha(despesa);
        });

        await atualizarTotal();
    } catch (err) {
        mostrarMensagem(err.message);
    }
}

function adicionarLinha(despesa) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${formatarData(despesa.data)}</td>
        <td>${despesa.descricao}</td>
        <td>${formatarMoeda(despesa.valor)}</td>
        <td>
            <button onclick="editarDespesa(${despesa.id})">✏️</button>
            <button onclick="excluirDespesa(${despesa.id})">🗑️</button>
        </td>
    `;
    tbody.appendChild(tr);
}

async function atualizarTotal() {
    const total = await calcularTotal();
    totalGeral.textContent = formatarMoeda(total);
}

async function excluirDespesa(id) {
    if (!confirmar("Deseja realmente excluir esta despesa?")) {
        return;
    }

    try {
        await removerDespesaStorage(id);
        await atualizarTabela();
    } catch (err) {
        mostrarMensagem(err.message);
    }
}

async function editarDespesa(id) {
    const despesa = await buscarDespesaPorId(id);
    if (!despesa) return;

    document.getElementById("data").value = despesa.data;
    document.getElementById("descricao").value = despesa.descricao;
    document.getElementById("valor").value = formatarMoeda(despesa.valor);
    document.getElementById("btnAdicionar").dataset.editando = id;
    document.getElementById("btnAdicionar").textContent = "Salvar Alteração";
}

async function limparTabela() {
    tbody.innerHTML = "";
    await atualizarTotal();
}
