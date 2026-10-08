/* Sushma Traders - GST calculation (pure functions, UI se alag). */
(function (root) {
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  /* lines: [{name,hsn,mrp,qty,price,disc,gst}]   inter=true => IGST, warna CGST+SGST (half-half) */
  function calcInvoice(lines, inter) {
    var out = [], sum = { qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, amount: 0 }, byRate = {};
    lines.forEach(function (l) {
      var qty = +l.qty || 0, price = +l.price || 0, disc = +l.disc || 0, gst = +l.gst || 0;
      var taxable = r2(qty * price * (1 - disc / 100));
      var cgst = 0, sgst = 0, igst = 0;
      if (inter) { igst = r2(taxable * gst / 100); }
      else { cgst = r2(taxable * gst / 200); sgst = cgst; }
      var tax = r2(cgst + sgst + igst), amount = r2(taxable + tax);
      out.push({ name: l.name || "", hsn: l.hsn || "", mrp: +l.mrp || 0, qty: qty, price: price, disc: disc, gst: gst,
                 taxable: taxable, cgst: cgst, sgst: sgst, igst: igst, tax: tax, amount: amount });
      sum.qty += qty; sum.taxable = r2(sum.taxable + taxable); sum.cgst = r2(sum.cgst + cgst);
      sum.sgst = r2(sum.sgst + sgst); sum.igst = r2(sum.igst + igst); sum.tax = r2(sum.tax + tax); sum.amount = r2(sum.amount + amount);
      var b = byRate[gst] = byRate[gst] || { rate: gst, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
      b.taxable = r2(b.taxable + taxable); b.cgst = r2(b.cgst + cgst); b.sgst = r2(b.sgst + sgst); b.igst = r2(b.igst + igst);
    });
    var grand = Math.round(sum.amount);
    return { lines: out, sum: sum, rates: Object.keys(byRate).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return byRate[k]; }),
             subtotal: sum.taxable, roundOff: r2(grand - sum.amount), grand: grand, inter: !!inter };
  }

  var ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function two(n) { return n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : ""); }
  function three(n) { var s = ""; if (n >= 100) { s = ones[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) s += " and "; } return s + (n ? two(n) : ""); }
  function words(num) {          /* Indian system: Thousand, Lakh, Crore */
    var rupees = Math.floor(num), paise = Math.round((num - rupees) * 100), parts = [];
    var cr = Math.floor(rupees / 10000000); rupees %= 10000000;
    var lk = Math.floor(rupees / 100000); rupees %= 100000;
    var th = Math.floor(rupees / 1000); rupees %= 1000;
    if (cr) parts.push(three(cr) + " Crore"); if (lk) parts.push(two(lk) + " Lakh"); if (th) parts.push(two(th) + " Thousand");
    var rest = rupees ? three(rupees) : "";
    var s = parts.join(" "); if (rest) s += (s ? (rupees < 100 ? " and " : " ") : "") + rest;
    if (!s) s = "Zero";
    if (paise) s += " and " + two(paise) + " Paise";
    return s + " Only";
  }

  var api = { r2: r2, calcInvoice: calcInvoice, words: words };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.InvCalc = api;
})(this);
