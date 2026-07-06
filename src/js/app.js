document.addEventListener("DOMContentLoaded", async () => {

    await atualizarTabela();

    document.getElementById("btnExcel")
        .addEventListener("click", exportarExcel);

    document.getElementById("btnPdf")
        .addEventListener("click", exportarPDF);

    document.getElementById("btnLimpar").addEventListener("click", async () => {
        const confirmar = confirm("Tem certeza que deseja apagar todas as despesas?");
        if (!confirmar) return;

        try {
            await limparStorage();
            await atualizarTabela();
            mostrarMensagem("Todas as despesas foram removidas com sucesso!");
        } catch (err) {
            mostrarMensagem(err.message);
        }
    });

    try {
        const userData = await fetch("/api/auth/me");
        if (userData.ok) {
            const me = await userData.json();
            const nomeEl = document.createElement("div");
            nomeEl.style.cssText = "text-align:right;padding:4px 12px;font-size:13px;color:#666;";
            nomeEl.innerHTML = `Olá, ${me.nome} | <a href="/api/auth/logout" style="color:#d32f2f;">Sair</a>`;
            document.querySelector(".header").after(nomeEl);
        }
    } catch (e) {
        // não autenticado
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
