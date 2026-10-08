/* Sushma Traders - invoice settings. Yahan se seller/bank details aur product-wise HSN + GST rate badal sakte ho. */
var SELLER = {
  name: "SUSHMA TRADERS",
  lines: ["GURUDWARA ROAD TARKESHWARI COLONY OLD SHIVPURI", "MADHYA PRADESH, SHIVPURI 473551"],
  mobile: "9977869577, 7415808680",
  gstin: "23BROPG2977C1ZT",   // <-- invoice ki photo se padha hai, ek baar original se check kar lena
  stateCode: "23",
  state: "Madhya Pradesh"
};
var BANK = { bank: "IDBI BANK", account: "1564651100004336", ifsc: "IBKL0001564", holder: "SUSHMA TRADERS" };
var TERMS = [
  "We Pack & Check goods carefully hence no responsibility for loss in trasit.",
  "Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.",
  "Goods once sold will not be taken back., All Subject to SHIVPURI Jurisdiction only.E.& O.E."
];
var NEXT_INVOICE_START = 243;   // pichla invoice J-242 tha
var INVOICE_PREFIX = "J-";

/* State code (GSTIN ke pehle 2 digit) -> state */
var STATES = {"01":"Jammu & Kashmir","02":"Himachal Pradesh","03":"Punjab","04":"Chandigarh","05":"Uttarakhand","06":"Haryana","07":"Delhi","08":"Rajasthan","09":"Uttar Pradesh","10":"Bihar","11":"Sikkim","12":"Arunachal Pradesh","13":"Nagaland","14":"Manipur","15":"Mizoram","16":"Tripura","17":"Meghalaya","18":"Assam","19":"West Bengal","20":"Jharkhand","21":"Odisha","22":"Chhattisgarh","23":"Madhya Pradesh","24":"Gujarat","26":"Dadra & Nagar Haveli and Daman & Diu","27":"Maharashtra","29":"Karnataka","30":"Goa","31":"Lakshadweep","32":"Kerala","33":"Tamil Nadu","34":"Puducherry","35":"Andaman & Nicobar","36":"Telangana","37":"Andhra Pradesh","38":"Ladakh"};

/* Product -> [HSN, GST%].  DHYAN: 22-Sep-2025 ke GST 2.0 ke baad ke rates ke hisaab se default rakhe hain.
   Face wash, fruit drink, detergent, dishwash ke rate pakke nahi hain - apne CA / purchase bill se confirm karke yahan badlo.
   Invoice me har line ka GST% waise bhi screen pe edit ho sakta hai. */
var GST_MAP = {
  "Liv.52":[ "3004",5], "Liv.52 DS":["3004",5], "Ashwagandha":["3004",5], "Organic Ashwagandha":["3004",5],
  "Organic Gokshura":["3004",5], "Shilajit Capsules":["3004",5], "Tentex Forte":["3004",5], "Tentex Royal":["3004",5],
  "Confido":["3004",5], "OphthaCare Eye Drops":["3004",5], "Koflet-SF Lozenges":["3004",5],
  "Cucumber & Coconut Soap":["3401",5], "Almond & Rose Soap":["3401",5], "Bath Soap":["3401",5],
  "Anti-Hair Fall Hair Oil":["3305",5], "Herbal Shampoo":["3305",5], "Toothpaste":["3306",5],
  "Purifying Neem Face Wash":["3304",18],
  "Glucose Biscuits":["1905",5], "Cream Biscuits":["1905",5], "Potato Chips":["2005",5], "Namkeen Mix":["2106",5],
  "Instant Noodles":["1902",5], "Tea Powder":["0902",5], "Fruit Drink":["2202",18],
  "Dishwash Bar":["3402",18], "Detergent Powder":["3402",18]
};
