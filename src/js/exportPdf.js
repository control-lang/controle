async function exportarPDF() {
    const despesas = await buscarDespesas();

    if (!despesas || despesas.length === 0) {
        mostrarMensagem("Não existem despesas para exportar.");
        return;
    }

    const nomeFuncionario =
        document.getElementById("nome").value.trim() || "Não informado";
    const mesReferencia =
        document.getElementById("mes").value.trim() || "Não informado";

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(31, 78, 120);
    doc.rect(0, 0, 220, 18, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("SE SOLUÇÕES LTDA", 105, 12, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text("RELATÓRIO DE DESPESAS", 105, 28, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Funcionário: ${nomeFuncionario}`, 14, 40);
    doc.text(`Mês: ${mesReferencia}`, 14, 48);
    doc.text(
        `Emitido em: ${new Date().toLocaleDateString("pt-BR")}`,
        14, 56
    );

    doc.autoTable({
        startY: 65,
        head: [["Data", "Descrição", "Valor"]],
        body: despesas.map(item => [
            formatarData(item.data),
            item.descricao,
            `R$ ${Number(item.valor).toFixed(2)}`
        ]),
        headStyles: { fillColor: [66, 103, 178] },
        styles: { fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const total = despesas.reduce((acc, item) => acc + Number(item.valor), 0);

    doc.setFillColor(220, 240, 220);
    doc.rect(14, finalY - 6, 182, 10, "F");
    doc.setFontSize(11);
    doc.text("TOTAL GERAL", 16, finalY);
    doc.text(`R$ ${total.toFixed(2)}`, 180, finalY, { align: "right" });

    doc.save("relatorio-despesas.pdf");
}
