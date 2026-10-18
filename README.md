# secondsun.ee

Second Suni koduleht. Staatiline leht (`public/`) ja väike Cloudflare Worker (`src/worker.js`), mis saadab kontaktivormi päringud e-postiga.

## Avaldamine
Cloudflare → Workers & Pages → Create → Import a repository → vali see repo. Build command jääb tühjaks, deploy command `npx wrangler deploy`.
Iga `main` haru muudatus avaldatakse automaatselt.

## Domeen
Worker → Settings → Domains & Routes → lisa `www.secondsun.ee` ja `secondsun.ee` (ilma www-ta suunatakse www-le).

## Päringute e-post
1. Domeeni Email Routing peab olema sisse lülitatud.
2. `TO_ADDRESS` (wrangler.jsonc) peab olema Email Routingus kinnitatud sihtaadress.
3. `FROM_ADDRESS` peab olema `@secondsun.ee` aadress.
