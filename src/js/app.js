/**
 * ==========================================
 * app.js
 * Inicialização da aplicação
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", () => {

    // Carrega tabela
    atualizarTabela();

    // =====================
    // Excel
    // =====================

    document
        .getElementById("btnExcel")
        .addEventListener("click", exportarExcel);

    // =====================
    // PDF
    // =====================

    document
        .getElementById("btnPdf")
        .addEventListener("click", exportarPDF);

    // =====================
    // Limpar Tudo
    // =====================

    document.getElementById("btnLimpar").addEventListener("click", () => {

    const confirmar = confirm("Tem certeza que deseja apagar todas as despesas?");

    if (!confirmar) return;

    localStorage.removeItem("despesas");

    atualizarTabela();

    mostrarMensagem("Todas as despesas foram removidas com sucesso!");

});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

   /* document
        .getElementById("btnLimpar")
        .addEventListener("click", () => {

            if (!confirm("Deseja apagar todas as despesas?")) {
                return;
            }

            localStorage.removeItem("despesas");

            atualizarTabela();

            mostrarMensagem("Todas as despesas foram removidas.");

        });  */

        import { exportPdf } from "./exportPdf.js";

exportPdf(despesas, {
  funcionario: "João",
  mes: "Julho/2026",
  emitidoEm: "01/07/2026"
});

});