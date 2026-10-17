# Planinka

Demo website for a mountain cabin on Vlašić, made as a sample for cabin and apartment owners. The cabin, prices, reviews and contact are made up.

**Live:** https://planinka.grabafaceit.workers.dev

## What's inside

- Illustrated first screen with a winter and summer switch
- Gallery, amenities, location, things to do, reviews and FAQ
- Seasonal prices with a calculator for every night and extra guests
- Booking request that opens Viber or WhatsApp with the message already written
- Bosnian, English and German, keyboard friendly and respects reduced motion

## Tech

Plain HTML, CSS and JavaScript, no framework, server or database. Hosted on Cloudflare Workers. All cabin data is in `data/vikendica.js`, so a new client mostly means editing that one file.

## Run locally

```
node serve.mjs
```

Then open http://localhost:8080.

Made by [Ahmed Grabus (Graba)](https://graba-portofolio.grabafaceit.workers.dev)
