# Claude Code — Project Notes

## Dev Server

Start the app with:

```bash
npm start
```

Runs on `http://localhost:5173`.

## Playwright MCP Setup (WSL)

The `.mcp.json` is configured to use `chromium` (Chrome is not available in WSL).

First-time setup — install the browser once:

```bash
npx @playwright/mcp install-browser chrome-for-testing
```

After that, the Playwright MCP server works as normal. Make sure the dev server is running before navigating.
