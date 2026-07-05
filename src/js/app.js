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

    const userData = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (userData.ok) {
        const me = await userData.json();
        const nomeEl = document.createElement("div");
        nomeEl.style.cssText = "text-align:right;padding:4px 12px;font-size:13px;color:#666;";
        nomeEl.innerHTML = `Olá, ${me.nome} | <a href="#" id="btnLogout" style="color:#d32f2f;">Sair</a>`;
        document.querySelector(".header").after(nomeEl);

        document.getElementById("btnLogout").addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });
            window.location.href = "/login";
        });
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
