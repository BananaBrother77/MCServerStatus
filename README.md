# MCToolkit

A collection of Minecraft tools — check server status, look up players, browse colour codes, and more.

## Tools

| Tool | Description |
|------|-------------|
| [Server Status](/server-status.html) | Check live Minecraft server status — online players, version, MOTD, server icon, saved servers, and MCServerHost node status. |
| [Player Viewer](/player-viewer.html) | Look up any Minecraft player — view their skin in 3D, UUID, name history, cape, and link to NameMC. |
| [Colour Codes](/color-codes.html) | Browse Minecraft colour and format codes, then create formatted text for chat, signs, books, and more. |

## Development

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Build + preview with Wrangler
npm run deploy   # Build + deploy to Cloudflare Pages
```

## Stack

- **Build:** [Vite](https://vitejs.dev/) with multi-page HTML input
- **Partials:** EJS includes resolved at build time via `transformIndexHtml`
- **Deploy:** [Cloudflare Pages](https://pages.cloudflare.com/) via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- **3D Rendering:** [skinview3d](https://github.com/bs-community/skinview3d) for player skin viewer
- **Icons:** [Lucide](https://lucide.dev/)

Built by [BananaBrother77](https://github.com/BananaBrother77).
