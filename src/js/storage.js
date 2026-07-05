const API = "/api";

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        ...options,
    });
    if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("Não autenticado");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || "Erro na requisição");
    return data;
}

async function buscarDespesas() {
    const data = await apiFetch("/despesas");
    return data;
}

async function salvarDespesas() {
}

async function adicionarDespesaStorage(despesa) {
    await apiFetch("/despesas", {
        method: "POST",
        body: JSON.stringify(despesa),
    });
}

async function atualizarDespesaStorage(id, novosDados) {
    await apiFetch(`/despesas/${id}`, {
        method: "PUT",
        body: JSON.stringify(novosDados),
    });
}

async function removerDespesaStorage(id) {
    await apiFetch(`/despesas/${id}`, { method: "DELETE" });
}

async function limparStorage() {
    const despesas = await buscarDespesas();
    for (const d of despesas) {
        await removerDespesaStorage(d.id);
    }
}

async function calcularTotal() {
    const data = await apiFetch("/despesas/total");
    return data.total;
}

async function possuiDespesas() {
    const despesas = await buscarDespesas();
    return despesas.length > 0;
}

async function buscarDespesaPorId(id) {
    const despesas = await buscarDespesas();
    return despesas.find(item => item.id === id) || null;
}

async function quantidadeDespesas() {
    const despesas = await buscarDespesas();
    return despesas.length;
}
