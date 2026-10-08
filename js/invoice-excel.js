/* Sushma Traders - Excel export (ExcelJS). Formulas live rakhe hain, taaki Excel me khol ke bhi calculation verify ho sake. */
(function (root) {
  var NUM = "#,##0.00", thin = { style: "thin" }, BORDER = { top: thin, left: thin, bottom: thin, right: thin };
  function isoToDate(s) { return new Date(s + "T00:00:00Z"); }
  function F(formula, result) { return { formula: formula, result: result }; }
  function box(row, from, to, bold, fill) {
    for (var c = from; c <= to; c++) { var cell = row.getCell(c); cell.border = BORDER; if (bold) cell.font = { bold: true }; if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEDED" } }; }
  }

  /* ---- ek invoice ki sheet ---- */
  function addInvoiceSheet(wb, inv) {
    var ws = wb.addWorksheet("Invoice", { pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    var t = inv.totals, inter = t.inter, p = inv.party;
    ws.columns = [{ width: 6 }, { width: 36 }, { width: 11 }, { width: 10 }, { width: 8 }, { width: 11 }, { width: 8 }, { width: 13 }, { width: 8 }, { width: 12 }, { width: 14 }];
    function merged(r, text, opt) { ws.mergeCells(r, 1, r, 11); var c = ws.getCell(r, 1); c.value = text; if (opt) { if (opt.font) c.font = opt.font; if (opt.align) c.alignment = { horizontal: opt.align }; } }
    merged(1, SELLER.name, { font: { bold: true, size: 16 } });
    merged(2, SELLER.lines.join(", "));
    merged(3, "MOB: " + SELLER.mobile + "    GSTIN: " + SELLER.gstin);
    merged(4, "GST TAX INVOICE", { font: { bold: true, size: 13 }, align: "center" });
    var info = [
      ["Billed to:", p.name, "Invoice No:", inv.no],
      ["Address:", p.addr, "Date:", isoToDate(inv.date)],
      ["Mobile:", p.mobile, "Type:", inv.type],
      ["GSTIN:", p.gstin || "-", "Sales by:", inv.salesBy || ""],
      ["State:", p.state + " (" + p.stateCode + ")", "Supply:", inter ? "Inter-state (IGST)" : "Intra-state (CGST+SGST)"]
    ];
    info.forEach(function (a, i) {
      var r = 5 + i; ws.getCell(r, 1).value = a[0]; ws.getCell(r, 1).font = { bold: true }; ws.mergeCells(r, 2, r, 5); ws.getCell(r, 2).value = a[1];
      ws.mergeCells(r, 7, r, 8); ws.getCell(r, 7).value = a[2]; ws.getCell(r, 7).font = { bold: true }; ws.mergeCells(r, 9, r, 11); ws.getCell(r, 9).value = a[3];
      if (a[3] instanceof Date) ws.getCell(r, 9).numFmt = "dd/mmm/yyyy"; ws.getCell(r, 9).alignment = { horizontal: "left" };
    });
    var h = 11, hdr = ["S.N", "Description of Goods", "HSN Code", "MRP", "Qty", "Price", "Disc %", "Taxable", "GST %", "GST Amt", "Amount"];
    hdr.forEach(function (x, i) { ws.getCell(h, i + 1).value = x; }); box(ws.getRow(h), 1, 11, true, true); ws.getRow(h).alignment = { horizontal: "center" };
    var first = h + 1, last = h + t.lines.length;
    t.lines.forEach(function (l, i) {
      var r = first + i, row = ws.getRow(r);
      row.getCell(1).value = i + 1; row.getCell(2).value = l.name; row.getCell(3).value = l.hsn; row.getCell(4).value = l.mrp || null;
      row.getCell(5).value = l.qty; row.getCell(6).value = l.price; row.getCell(7).value = l.disc; row.getCell(9).value = l.gst;
      row.getCell(8).value = F("ROUND(E" + r + "*F" + r + "*(1-G" + r + "/100),2)", l.taxable);
      row.getCell(10).value = inter ? F("ROUND(H" + r + "*I" + r + "/100,2)", l.tax) : F("2*ROUND(H" + r + "*I" + r + "/200,2)", l.tax);
      row.getCell(11).value = F("H" + r + "+J" + r, l.amount);
      [4, 6, 8, 10, 11].forEach(function (c) { row.getCell(c).numFmt = NUM; }); box(row, 1, 11);
    });
    var tr = last + 1, trow = ws.getRow(tr);
    trow.getCell(2).value = "Total";
    trow.getCell(5).value = F("SUM(E" + first + ":E" + last + ")", t.sum.qty);
    trow.getCell(8).value = F("SUM(H" + first + ":H" + last + ")", t.sum.taxable);
    trow.getCell(10).value = F("SUM(J" + first + ":J" + last + ")", t.sum.tax);
    trow.getCell(11).value = F("SUM(K" + first + ":K" + last + ")", t.sum.amount);
    [8, 10, 11].forEach(function (c) { trow.getCell(c).numFmt = NUM; }); box(trow, 1, 11, true);

    /* GST summary (rate-wise) */
    var s = tr + 2, sh = ["GST Class", "", "Taxable", "CGST", "SGST", "IGST", "Total GST"];
    ws.getCell(s, 1).value = "GST Summary"; ws.getCell(s, 1).font = { bold: true };
    s++; ws.mergeCells(s, 1, s, 2); sh.forEach(function (x, i) { if (i !== 1) ws.getCell(s, i === 0 ? 1 : i + 1).value = x; }); box(ws.getRow(s), 1, 7, true, true);
    var sFirst = s + 1;
    t.rates.forEach(function (b, i) {
      var r = sFirst + i, row = ws.getRow(r); ws.mergeCells(r, 1, r, 2); row.getCell(1).value = "GST " + b.rate + "%";
      var rng = function (col) { return "SUMIF($I$" + first + ":$I$" + last + "," + b.rate + ",$" + col + "$" + first + ":$" + col + "$" + last + ")"; };
      row.getCell(3).value = F(rng("H"), b.taxable);
      row.getCell(4).value = inter ? 0 : F(rng("J") + "/2", b.cgst);
      row.getCell(5).value = inter ? 0 : F(rng("J") + "/2", b.sgst);
      row.getCell(6).value = inter ? F(rng("J"), b.igst) : 0;
      row.getCell(7).value = F("D" + r + "+E" + r + "+F" + r, b.cgst + b.sgst + b.igst);
      for (var c = 3; c <= 7; c++) row.getCell(c).numFmt = NUM; box(row, 1, 7);
    });
    var sLast = sFirst + t.rates.length - 1, st = sLast + 1, srow = ws.getRow(st); ws.mergeCells(st, 1, st, 2); srow.getCell(1).value = "Total";
    [["C", 3, t.sum.taxable], ["D", 4, t.sum.cgst], ["E", 5, t.sum.sgst], ["F", 6, t.sum.igst], ["G", 7, t.sum.tax]].forEach(function (a) {
      srow.getCell(a[1]).value = F("SUM(" + a[0] + sFirst + ":" + a[0] + sLast + ")", a[2]); srow.getCell(a[1]).numFmt = NUM; }); box(srow, 1, 7, true);

    /* totals box */
    var g = st + 2;
    [["Sub total", F("H" + tr, t.subtotal)], ["Total GST", F("J" + tr, t.sum.tax)], ["Rounded Off", F("ROUND(K" + tr + ",0)-K" + tr, t.roundOff)], ["Grand Total", F("ROUND(K" + tr + ",0)", t.grand)]].forEach(function (a, i) {
      var r = g + i; ws.mergeCells(r, 8, r, 10); ws.getCell(r, 8).value = a[0]; ws.getCell(r, 8).font = { bold: i === 3, size: i === 3 ? 12 : 11 };
      ws.getCell(r, 11).value = a[1]; ws.getCell(r, 11).numFmt = NUM; ws.getCell(r, 11).font = { bold: i === 3, size: i === 3 ? 12 : 11 }; box(ws.getRow(r), 8, 11); });
    ws.mergeCells(g, 1, g, 6); ws.getCell(g, 1).value = "Amount in words:"; ws.getCell(g, 1).font = { bold: true };
    ws.mergeCells(g + 1, 1, g + 2, 6); ws.getCell(g + 1, 1).value = InvCalc.words(t.grand); ws.getCell(g + 1, 1).alignment = { wrapText: true, vertical: "top" };
    var b = g + 5;
    ws.getCell(b, 1).value = "Bank: " + BANK.bank + "    A/c No: " + BANK.account + "    IFSC: " + BANK.ifsc + "    A/c holder: " + BANK.holder; ws.getCell(b, 1).font = { bold: true };
    ws.getCell(b + 1, 1).value = "Terms & Conditions"; ws.getCell(b + 1, 1).font = { bold: true };
    TERMS.forEach(function (x, i) { ws.getCell(b + 2 + i, 1).value = (i + 1) + ". " + x; });
    ws.getCell(b + 6, 9).value = "Authorised Signatory";
    return ws;
  }

  /* ---- register: saare invoices ---- */
  function addRegisterSheets(wb, list) {
    var rg = wb.addWorksheet("Register");
    var rh = ["Invoice No", "Date", "Type", "Party", "Address", "Mobile", "GSTIN", "State", "Supply", "Taxable", "CGST", "SGST", "IGST", "Total GST", "Round Off", "Grand Total", "Sales By"];
    rg.addRow(rh); rg.getRow(1).font = { bold: true };
    list.forEach(function (v) {
      var t = v.totals, p = v.party, row = rg.addRow([v.no, isoToDate(v.date), v.type, p.name, p.addr, p.mobile, p.gstin || "", p.state, t.inter ? "Inter (IGST)" : "Intra (CGST+SGST)",
        t.sum.taxable, t.sum.cgst, t.sum.sgst, t.sum.igst, null, t.roundOff, t.grand, v.salesBy || ""]);
      row.getCell(14).value = F("K" + row.number + "+L" + row.number + "+M" + row.number, t.sum.tax); row.getCell(2).numFmt = "dd-mmm-yyyy";
      [10, 11, 12, 13, 14, 15, 16].forEach(function (c) { row.getCell(c).numFmt = NUM; });
    });
    var n = list.length + 1, tot = rg.addRow(["TOTAL"]); tot.font = { bold: true };
    if (n > 1) ["J", "K", "L", "M", "N", "O", "P"].forEach(function (c, i) {
      var sum = 0; list.forEach(function (v) { var t = v.totals; sum += [t.sum.taxable, t.sum.cgst, t.sum.sgst, t.sum.igst, t.sum.tax, t.roundOff, t.grand][i]; });
      tot.getCell(10 + i).value = F("SUM(" + c + "2:" + c + n + ")", InvCalc.r2(sum)); tot.getCell(10 + i).numFmt = NUM; });
    rg.columns.forEach(function (c, i) { c.width = [12, 12, 8, 24, 26, 13, 17, 16, 18, 12, 11, 11, 11, 11, 10, 13, 20][i]; });
    rg.views = [{ state: "frozen", ySplit: 1 }]; rg.autoFilter = { from: "A1", to: "Q1" };

    var li = wb.addWorksheet("Line Items");
    li.addRow(["Invoice No", "Date", "Party", "S.N", "Product", "HSN", "MRP", "Qty", "Price", "Disc %", "Taxable", "GST %", "CGST", "SGST", "IGST", "Amount"]); li.getRow(1).font = { bold: true };
    list.forEach(function (v) { v.totals.lines.forEach(function (l, i) {
      var row = li.addRow([v.no, isoToDate(v.date), v.party.name, i + 1, l.name, l.hsn, l.mrp || null, l.qty, l.price, l.disc, l.taxable, l.gst, l.cgst, l.sgst, l.igst, l.amount]);
      row.getCell(2).numFmt = "dd-mmm-yyyy"; [7, 9, 11, 13, 14, 15, 16].forEach(function (c) { row.getCell(c).numFmt = NUM; }); }); });
    li.columns.forEach(function (c, i) { c.width = [12, 12, 24, 6, 28, 9, 9, 7, 10, 8, 12, 8, 11, 11, 11, 12][i]; });
    li.views = [{ state: "frozen", ySplit: 1 }]; li.autoFilter = { from: "A1", to: "P1" };

    /* rate-wise summary (GSTR-1 / GSTR-3B ke liye kaam aayega) - formulas Line Items se */
    var sm = wb.addWorksheet("GST Summary"), rates = {}; list.forEach(function (v) { v.totals.lines.forEach(function (l) { rates[l.gst] = 1; }); });
    sm.addRow(["GST %", "Taxable", "CGST", "SGST", "IGST", "Total GST"]); sm.getRow(1).font = { bold: true };
    var lastL = Math.max(2, li.rowCount);
    Object.keys(rates).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
      var row = sm.addRow([r]), n2 = row.number, acc = [0, 0, 0, 0];
      list.forEach(function (v) { v.totals.lines.forEach(function (l) { if (l.gst === r) { acc[0] += l.taxable; acc[1] += l.cgst; acc[2] += l.sgst; acc[3] += l.igst; } }); });
      ["K", "M", "N", "O"].forEach(function (c, i) { row.getCell(2 + i).value = F("SUMIF('Line Items'!$L$2:$L$" + lastL + ",$A" + n2 + ",'Line Items'!$" + c + "$2:$" + c + "$" + lastL + ")", InvCalc.r2(acc[i])); });
      row.getCell(6).value = F("C" + n2 + "+D" + n2 + "+E" + n2, InvCalc.r2(acc[1] + acc[2] + acc[3])); for (var c = 2; c <= 6; c++) row.getCell(c).numFmt = NUM; });
    sm.columns.forEach(function (c) { c.width = 14; });
  }

  function invoiceWorkbook(inv) { var wb = new ExcelJS.Workbook(); wb.calcProperties = { fullCalcOnLoad: true }; addInvoiceSheet(wb, inv); return wb; }
  function registerWorkbook(list) { var wb = new ExcelJS.Workbook(); wb.calcProperties = { fullCalcOnLoad: true }; addRegisterSheets(wb, list); return wb; }
  var api = { invoiceWorkbook: invoiceWorkbook, registerWorkbook: registerWorkbook };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.InvExcel = api;
})(this);
