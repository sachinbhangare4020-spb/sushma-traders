# Sushma Traders - FMCG Distributor Website

Simple B2B ordering website (plain HTML, CSS and JavaScript, no build step).
Retailers add products to the cart and send the order to the distributor on WhatsApp (9977869577).

## Structure
```
index.html        main page
css/style.css     all styling
js/products.js    product list and rates (edit this to add or change products)
js/script.js      product grid, cart, WhatsApp message
images/           product photos
```

## Run locally
Open `index.html` in a browser.

## Host free on GitHub Pages
1. Create a new repository on GitHub and upload all these files (keep the folders).
2. Go to Settings > Pages > Source: Deploy from a branch > `main` / root > Save.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Add a product
Put a photo in `images/` (for example `rice.jpg`), then add one line in `js/products.js`:
`["Category","Product name","Short description","🌿","Pack info","rice"]`
and its rate in the `PN` list (`"Product name":100`).

Note: rates are sample rates.
