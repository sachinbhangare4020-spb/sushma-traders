/* Sushma Traders - invoice page logic */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var KEY = "st_invoices", NKEY = "st_next_invoice";
  var lines = [], inter = false, calc = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return (+n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function showDate(iso) { var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], p = iso.split("-"); return p[2] + "/" + m[+p[1] - 1] + "/" + p[0]; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function nextNo() { var n = +localStorage.getItem(NKEY); return n >= NEXT_INVOICE_START ? n : NEXT_INVOICE_START; }
  function say(t, cls) { var m = $("msg"); m.textContent = t; m.className = "hint " + (cls || ""); }
  function blank() { return { name: "", hsn: "", mrp: "", qty: 1, price: "", disc: 0, gst: 18 }; }

  /* ---------- init ---------- */
  var sel = $("pState"); Object.keys(STATES).forEach(function (c) { sel.innerHTML += '<option value="' + c + '">' + STATES[c] + " (" + c + ")</option>"; });
  sel.value = SELLER.stateCode;
  $("plist").innerHTML = Object.keys(PN).map(function (n) { return '<option value="' + esc(n) + '">'; }).join("");
  function resetForm() {
    $("invNo").value = INVOICE_PREFIX + nextNo(); $("invDate").value = today(); $("invType").value = "CREDIT"; $("salesBy").value = "";
    ["pName", "pAddr", "pMob", "pGstin", "pDue"].forEach(function (i) { $(i).value = ""; }); sel.value = SELLER.stateCode;
    lines = [blank()]; rows(); recalc(); say("");
  }

  /* ---------- item rows ---------- */
  function rows() {
    $("rows").innerHTML = lines.map(function (l, i) {
      function inp(f, t, extra) { return '<input data-i="' + i + '" data-f="' + f + '" type="' + (t || "text") + '" value="' + esc(l[f]) + '" ' + (extra || "") + ">"; }
      return "<tr><td>" + (i + 1) + '</td><td style="min-width:200px">' + inp("name", "text", 'list="plist" placeholder="product naam"') + "</td><td>" + inp("hsn", "text", 'style="width:75px"') +
        "</td><td>" + inp("mrp", "number", 'min="0" step="0.01" style="width:80px"') + "</td><td>" + inp("qty", "number", 'min="0" step="any" style="width:70px"') +
        "</td><td>" + inp("price", "number", 'min="0" step="0.01" style="width:90px"') + "</td><td>" + inp("disc", "number", 'min="0" max="100" step="0.01" style="width:65px"') +
        "</td><td>" + inp("gst", "number", 'min="0" max="40" step="0.01" style="width:65px"') +
        '</td><td class="c" id="t' + i + '"></td><td class="c" id="g' + i + '"></td><td class="c" id="a' + i + '"></td><td><button class="x" data-del="' + i + '" title="Remove">&times;</button></td></tr>';
    }).join("");
  }
  $("rows").addEventListener("input", function (e) {
    var t = e.target, i = t.dataset.i, f = t.dataset.f; if (i == null) return;
    lines[i][f] = t.value; recalc();
  });
  $("rows").addEventListener("change", function (e) {          /* product chuna => price / HSN / GST auto bhar do */
    var t = e.target; if (t.dataset.f !== "name") return; var i = t.dataset.i, n = t.value;
    if (PN[n] != null) { var g = GST_MAP[n] || ["", 18]; lines[i].price = PN[n]; lines[i].hsn = g[0]; lines[i].gst = g[1]; setTimeout(function () { rows(); recalc(); }, 0); }
  });
  $("rows").addEventListener("click", function (e) {
    var d = e.target.dataset.del; if (d == null) return; lines.splice(+d, 1); if (!lines.length) lines.push(blank()); rows(); recalc();
  });
  $("addRow").onclick = function () { lines.push(blank()); rows(); recalc(); };

  /* ---------- party / GST mode ---------- */
  $("pGstin").addEventListener("input", function () {
    var g = this.value.toUpperCase(); this.value = g;
    if (/^\d{2}/.test(g) && STATES[g.slice(0, 2)]) sel.value = g.slice(0, 2);
    recalc();
  });
  ["pName", "pAddr", "pMob", "pDue", "invNo", "invDate", "invType", "salesBy", "pState"].forEach(function (i) { $(i).addEventListener("input", recalc); });

  /* ---------- calculation + preview ---------- */
  function recalc() {
    inter = sel.value !== SELLER.stateCode;
    calc = InvCalc.calcInvoice(lines, inter);
    calc.lines.forEach(function (l, i) { var a = $("t" + i); if (!a) return; a.textContent = fmt(l.taxable); $("g" + i).textContent = fmt(l.tax); $("a" + i).textContent = fmt(l.amount); });
    var g = $("pGstin").value, bad = g && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g);
    var gm = $("gstMode"); gm.className = "hint" + (bad ? " err" : "");
    gm.textContent = (inter ? "Inter-state sale: IGST lagega. " : "Same state (Madhya Pradesh): CGST + SGST lagega. ") + (bad ? "GSTIN ka format sahi nahi lag raha." : "");
    $("sheet").innerHTML = sheet();
  }
  function current() {
    var code = sel.value;
    return { no: $("invNo").value.trim(), date: $("invDate").value || today(), type: $("invType").value, salesBy: $("salesBy").value.trim(),
      party: { name: $("pName").value.trim(), addr: $("pAddr").value.trim(), mobile: $("pMob").value.trim(), gstin: $("pGstin").value.trim(), stateCode: code, state: STATES[code], due: +$("pDue").value || 0 },
      totals: calc };
  }
  function sheet() {
    var v = current(), p = v.party, t = v.totals, cols = inter ? ["IGST"] : ["CGST", "SGST"];
    var body = t.lines.map(function (l, i) {
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(l.name) + "</td><td>" + esc(l.hsn) + '</td><td class="r">' + (l.mrp ? fmt(l.mrp) : "") + '</td><td class="r">' + l.qty + '</td><td class="r">' + fmt(l.price) +
        '</td><td class="r">' + (l.disc ? l.disc + "%" : "0%") + '</td><td class="r">' + fmt(l.taxable) + '</td><td class="r">' + l.gst + '%</td><td class="r">' + fmt(l.tax) + '</td><td class="r">' + fmt(l.amount) + "</td></tr>";
    }).join("");
    var sumRows = t.rates.map(function (b) { return "<tr><td>GST " + b.rate + '%</td><td class="r">' + fmt(b.taxable) + "</td>" + (inter ? '<td class="r">' + fmt(b.igst) + "</td>" : '<td class="r">' + fmt(b.cgst) + '</td><td class="r">' + fmt(b.sgst) + "</td>") + "</tr>"; }).join("");
    return '<div class="hd"><div><h1>' + esc(SELLER.name) + "</h1>" + SELLER.lines.map(esc).join("<br>") + "<br>MOB: " + esc(SELLER.mobile) + "<br>GSTIN: " + esc(SELLER.gstin) + '</div><div style="text-align:right"><b>Page 1/1</b></div></div>' +
      '<div class="ti">GST TAX INVOICE</div>' +
      '<div class="meta"><div><b>Billed to:</b> ' + esc(p.name) + "<br>" + esc(p.addr) + "<br>Party Mobile No: " + esc(p.mobile) + (p.gstin ? "<br>GSTIN: " + esc(p.gstin) : "") + "<br>State: " + esc(p.state) + " (" + p.stateCode + ")" +
      (p.due ? "<br><b>DUE BAL.: &#8377;" + fmt(p.due) + "</b>" : "") + '</div><div><b>' + esc(v.type) + "</b><br><b>Invoice No.</b> " + esc(v.no) + "<br><b>Date of Invoice:</b> " + showDate(v.date) + (v.salesBy ? "<br><b>SALES BY</b> " + esc(v.salesBy) : "") + "</div></div>" +
      '<table class="li"><thead><tr><th>S.N</th><th>Description of Goods</th><th>HSN Code</th><th>MRP</th><th>Qty</th><th>Price</th><th>Disc%</th><th>Taxable</th><th>GST%</th><th>GST Amt</th><th>Amount</th></tr></thead><tbody>' + body +
      '<tr><td></td><td><b>Total</b></td><td></td><td></td><td class="r"><b>' + t.sum.qty + '</b></td><td></td><td></td><td class="r"><b>' + fmt(t.sum.taxable) + '</b></td><td></td><td class="r"><b>' + fmt(t.sum.tax) + '</b></td><td class="r"><b>' + fmt(t.sum.amount) + "</b></td></tr></tbody></table>" +
      '<div class="two"><div><table class="sm"><tr><th>CLASS</th><th>TAXABLE</th>' + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>" + sumRows + "</table></div>" +
      '<div><table class="sm"><tr><td>Sub total</td><td class="r">' + fmt(t.subtotal) + "</td></tr><tr><td>Total GST</td><td class=\"r\">" + fmt(t.sum.tax) + '</td></tr><tr><td>Rounded Off</td><td class="r">' + fmt(t.roundOff) + '</td></tr><tr><td class="gt">Grand Total</td><td class="r gt">' + fmt(t.grand) + "</td></tr></table></div></div>" +
      "<p><b>" + InvCalc.words(t.grand) + "</b></p>" +
      "<p><b>Bank:</b> " + esc(BANK.bank) + " &nbsp; <b>A/c No:</b> " + esc(BANK.account) + " &nbsp; <b>IFSC:</b> " + esc(BANK.ifsc) + " &nbsp; <b>FOR:</b> " + esc(BANK.holder) + "</p>" +
      '<div class="terms"><b>Terms &amp; Conditions</b><br>' + TERMS.map(function (x, i) { return (i + 1) + ". " + esc(x); }).join("<br>") + '</div><div class="sig"><span>Receiver Signature &amp; Mobile No.</span><span>Authorised Signatory</span></div>';
  }

  /* ---------- actions ---------- */
  function valid() {
    var v = current();
    if (!v.no) { say("Invoice number daalo.", "err"); return null; }
    if (!v.party.name) { say("Party ka naam daalo.", "err"); return null; }
    var ok = calc.lines.filter(function (l) { return l.name && l.qty > 0 && l.price > 0; });
    if (!ok.length || ok.length !== calc.lines.length) { say("Har item me product naam, qty aur price bharo (khali row hatao).", "err"); return null; }
    return v;
  }
  function download(wb, name) {
    wb.xlsx.writeBuffer().then(function (buf) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
  }
  function fileName(v) { return "Invoice_" + v.no.replace(/[^\w-]/g, "") + "_" + v.party.name.replace(/[^\w]+/g, "_").slice(0, 25) + ".xlsx"; }
  function persist(v) {       /* register me save: same invoice no ho to replace */
    var all = load().filter(function (x) { return x.no !== v.no; }); all.push(v);
    try { localStorage.setItem(KEY, JSON.stringify(all)); var m = /(\d+)\s*$/.exec(v.no); if (m && +m[1] >= nextNo()) localStorage.setItem(NKEY, +m[1] + 1); return true; }
    catch (e) { say("Browser storage me save nahi ho paya. Excel download karke rakh lo.", "err"); return false; }
  }
  $("save").onclick = function () { var v = valid(); if (!v) return; if (persist(v)) say("Invoice " + v.no + " register me save ho gaya. Ab Excel download ya print kar sakte ho.", "ok"); };
  $("xlsx").onclick = function () { var v = valid(); if (!v) return; if (typeof ExcelJS === "undefined") { say("Excel library load nahi hui (internet check karo).", "err"); return; } persist(v); download(InvExcel.invoiceWorkbook(v), fileName(v)); say("Excel download ho gaya.", "ok"); };
  $("print").onclick = function () { if (valid()) { persist(current()); window.print(); } };
  $("reg").onclick = function () {
    var all = load(); if (!all.length) { say("Abhi koi invoice save nahi hua.", "err"); return; } if (typeof ExcelJS === "undefined") { say("Excel library load nahi hui (internet check karo).", "err"); return; }
    all.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    download(InvExcel.registerWorkbook(all), "Sushma_Invoice_Register_" + today() + ".xlsx"); say(all.length + " invoices ka register download ho gaya.", "ok");
  };

  /* ---------- WhatsApp: PDF banao aur share karo ---------- */
  function makePdf(v) {
    if (typeof html2canvas === "undefined" || !window.jspdf) return Promise.reject(new Error("lib"));
    var box = document.createElement("div");      /* fixed width pe render, taaki phone pe bhi bill poora aaye */
    box.className = "sheet"; box.style.cssText = "position:fixed;left:-99999px;top:0;width:1100px;max-width:none;background:#fff";
    box.innerHTML = $("sheet").innerHTML; document.body.appendChild(box);
    return html2canvas(box, { scale: 2, backgroundColor: "#ffffff", windowWidth: 1200 }).then(function (cv) {
      box.remove();
      var pdf = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      var W = pdf.internal.pageSize.getWidth() - 12, H = pdf.internal.pageSize.getHeight() - 12, r = Math.min(W / cv.width, H / cv.height);
      pdf.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 6, 6, cv.width * r, cv.height * r);
      return pdf.output("blob");
    }, function (e) { box.remove(); throw e; });
  }
  function waText(v) {
    return "*" + SELLER.name + " - Tax Invoice " + v.no + "*\nDate: " + showDate(v.date) + "\nParty: " + v.party.name + "\nTaxable: Rs " + fmt(v.totals.subtotal) +
      "\nGST: Rs " + fmt(v.totals.sum.tax) + "\n*Grand Total: Rs " + fmt(v.totals.grand) + "*\n\nInvoice PDF attached. Thank you!";
  }
  $("wa").onclick = function () {
    var v = valid(); if (!v) return; persist(v); say("Invoice PDF ban rahi hai...", "");
    makePdf(v).then(function (blob) {
      var name = fileName(v).replace(/\.xlsx$/, ".pdf"), file = new File([blob], name, { type: "application/pdf" }), text = waText(v);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {          /* phone: share sheet khulega, WhatsApp chuno */
        return navigator.share({ files: [file], text: text }).then(function () { say("Share ho gaya.", "ok"); }, function (e) { if (e && e.name !== "AbortError") say("Share nahi ho paya: " + e.message, "err"); else say(""); });
      }
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      var d = ($("pMob").value.match(/\d/g) || []).join("").slice(-10);
      window.open("https://wa.me/" + (d.length === 10 ? "91" + d : "") + "?text=" + encodeURIComponent(text), "_blank");
      say("PDF download ho gayi aur WhatsApp chat khul gayi. Chat me 📎 (attach) se ye PDF bhej do.", "ok");
    }).catch(function () { say("PDF nahi ban payi (internet / library check karo). Print / Save as PDF try karo.", "err"); });
  };
  $("newInv").onclick = resetForm;
  resetForm();
})();
