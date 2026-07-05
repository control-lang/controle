async function exportarExcel() {
    const despesas = await buscarDespesas();

    if (!despesas || despesas.length === 0) {
        mostrarMensagem("Não existem despesas para exportar.");
        return;
    }

    const nomeFuncionario =
        document.getElementById("nome").value.trim() || "Não informado";
    const mesReferencia =
        document.getElementById("mes").value.trim() || "Não informado";

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SE SOLUÇÕES LTDA";
    workbook.company = "SE SOLUÇÕES LTDA";
    workbook.subject = "Relatório de Despesas";
    workbook.title = "Relatório de Despesas";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Despesas");

    sheet.columns = [
        { width: 15 },
        { width: 55 },
        { width: 18 }
    ];

    sheet.mergeCells("A1:C1");
    const empresa = sheet.getCell("A1");
    empresa.value = "SE SOLUÇÕES LTDA";
    empresa.font = {
        size: 18,
        bold: true,
        color: { argb: "FFFFFFFF" }
    };
    empresa.alignment = { horizontal: "center" };
    empresa.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" }
    };

    sheet.mergeCells("A2:C2");
    const titulo = sheet.getCell("A2");
    titulo.value = "RELATÓRIO DE DESPESAS";
    titulo.font = { size: 14, bold: true };
    titulo.alignment = { horizontal: "center" };

    sheet.addRow([]);
    sheet.addRow(["Funcionário:", nomeFuncionario]);
    sheet.addRow(["Mês:", mesReferencia]);
    sheet.addRow(["Emitido em:", new Date().toLocaleDateString("pt-BR")]);
    sheet.addRow([]);

    const cabecalho = sheet.addRow(["Data", "Descrição", "Valor"]);
    cabecalho.eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center" };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" }
        };
        cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        };
    });

    let total = 0;
    despesas.forEach(item => {
        const valor = Number(item.valor);
        total += valor;
        const linha = sheet.addRow([
            formatarData(item.data),
            item.descricao,
            valor
        ]);
        linha.getCell(3).numFmt = '"R$" #,##0.00';
        linha.eachCell(cell => {
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            };
        });
    });

    sheet.addRow([]);
    const totalRow = sheet.addRow(["", "TOTAL GERAL", total]);
    totalRow.font = { bold: true };
    totalRow.getCell(3).numFmt = '"R$" #,##0.00';
    totalRow.eachCell(cell => {
        cell.fill = {
            type: "pattern", pattern: "solid", fgColor: { argb: "FFD9EAD3" }
        };
        cell.border = {
            top: { style: "medium" },
            bottom: { style: "medium" },
            left: { style: "medium" },
            right: { style: "medium" }
        };
    });

    sheet.eachRow(row => { row.height = 22; });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }),
        "Relatorio_Despesas.xlsx"
    );
}
