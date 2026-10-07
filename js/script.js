/* Sushma Traders - grid, cart and WhatsApp order logic */
var cat="All",cart={};
var $=function(i){return document.getElementById(i)};
var cats=["All"].concat(P.map(function(p){return p[0]}).filter(function(v,i,a){return a.indexOf(v)===i}));
function chips(){$("chips").innerHTML=cats.map(function(c){return '<button class="chip" aria-pressed="'+(c===cat)+'" data-c="'+c+'">'+c+'</button>'}).join("")}
function grid(){$("grid").innerHTML=P.map(function(p,i){return p&&(cat==="All"||p[0]===cat)?'<article class="p"><div class="img'+(p[5]?' ph':'')+'" role="img" aria-label="'+p[1]+'">'+(p[5]?'<img src="'+'images/'+p[5]+'.jpg'+'" alt="'+p[1]+'">':p[3])+'</div><div class="pb"><h3>'+p[1]+'</h3><p>'+p[2]+'</p><span class="pack">'+p[4]+'</span>'+(PR[p[1]]?'<span class="pr">'+PR[p[1]]+'</span>':'')+'<button class="add" data-i="'+i+'">Add to Cart</button></div></article>':""}).join("")}
function total(){return Object.keys(cart).reduce(function(s,k){return s+cart[k]},0)}
function amt(){return Object.keys(cart).reduce(function(s,k){return s+cart[k]*PN[P[k][1]]},0)}
function render(){
$("count").textContent=total();$("tot").textContent="Estimated total: ₹"+amt();
var k=Object.keys(cart);
$("items").innerHTML=k.length?k.map(function(i){var p=P[i];return '<div class="row"><span class="e">'+(p[5]?'<img class="th" src="'+'images/'+p[5]+'.jpg'+'" alt="">':p[3])+'</span><span class="n">'+p[1]+'<br><small style="color:var(--mute);font-weight:400">'+p[4]+(PR[p[1]]?' · '+PR[p[1]]:'')+'</small></span><span class="q"><button data-m="'+i+'" aria-label="Decrease">−</button><b>'+cart[i]+'</b><button data-p="'+i+'" aria-label="Increase">+</button></span></div>'}).join(""):'<div class="empty">Your cart is empty.<br>Add products to start an order.</div>';
$("wa").disabled=!k.length}
function show(on){$("cart").classList.toggle("on",on);$("ov").classList.toggle("on",on);$("cart").setAttribute("aria-hidden",!on)}
document.addEventListener("click",function(e){
var t=e.target.closest("button,a");if(!t)return;
if(t.dataset.c){cat=t.dataset.c;chips();grid()}
else if(t.dataset.i){cart[t.dataset.i]=(cart[t.dataset.i]||0)+1;render();t.textContent="Added ✓";t.classList.add("done");setTimeout(function(){t.textContent="Add to Cart";t.classList.remove("done")},900)}
else if(t.dataset.p){cart[t.dataset.p]++;render()}
else if(t.dataset.m){if(--cart[t.dataset.m]<1)delete cart[t.dataset.m];render()}
else if(t.dataset.pg){e.preventDefault();alert(t.dataset.pg+": full text to be added by Sushma Traders.")}
});
$("open").onclick=function(){show(true)};$("close").onclick=$("ov").onclick=function(){show(false)};
document.addEventListener("keydown",function(e){if(e.key==="Escape")show(false)});
$("wa").onclick=function(){
var s=$("shop").value.trim();
var m="*New Order – Sushma Traders*\n"+(s?"Shop: "+s+"\n":"")+"\n"+Object.keys(cart).map(function(i,n){return (n+1)+". "+P[i][1]+" ("+P[i][4]+") x "+cart[i]+" @ "+PR[P[i][1]]+" = ₹"+PN[P[i][1]]*cart[i]}).join("\n")+"\n\nTotal items: "+total()+"\nEstimated total: ₹"+amt()+"\nPlease confirm availability and delivery.";
window.open("https://wa.me/919977869577?text="+encodeURIComponent(m),"_blank")};
chips();grid();render();
