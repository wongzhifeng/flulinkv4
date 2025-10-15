// Minimal Playwright MCP server
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { chromium, Browser, Page } from "playwright"

const server = new Server({ name: "flulink-playwright", version: "0.1.0" })

let browser: Browser | null = null
let page: Page | null = null

async function ensurePage(headless: boolean = true) {
  if (!browser) {
    browser = await chromium.launch({ headless })
  }
  if (!page) {
    const ctx = await browser.newContext()
    page = await ctx.newPage()
  }
  return page
}

server.tool(
  {
    name: "playwright_open",
    description: "Open a new Playwright page (optionally headful)",
    inputSchema: z.object({ headless: z.boolean().optional().default(true) }),
  },
  async ({ headless }) => {
    await ensurePage(headless)
    return { content: [{ type: "text", text: "page ready" }] }
  }
)

server.tool(
  {
    name: "playwright_goto",
    description: "Navigate to URL",
    inputSchema: z.object({ url: z.string().url() }),
  },
  async ({ url }) => {
    const p = await ensurePage()
    const resp = await p.goto(url)
    return { content: [{ type: "text", text: `navigated: ${resp?.status()} ${url}` }] }
  }
)

server.tool(
  {
    name: "playwright_click",
    description: "Click an element by selector",
    inputSchema: z.object({ selector: z.string() }),
  },
  async ({ selector }) => {
    const p = await ensurePage()
    await p.click(selector)
    return { content: [{ type: "text", text: `clicked: ${selector}` }] }
  }
)

server.tool(
  {
    name: "playwright_fill",
    description: "Fill an input by selector",
    inputSchema: z.object({ selector: z.string(), value: z.string() }),
  },
  async ({ selector, value }) => {
    const p = await ensurePage()
    await p.fill(selector, value)
    return { content: [{ type: "text", text: `filled: ${selector}` }] }
  }
)

server.tool(
  {
    name: "playwright_screenshot",
    description: "Take a screenshot (returns base64)",
    inputSchema: z.object({ fullPage: z.boolean().optional().default(true) }),
  },
  async ({ fullPage }) => {
    const p = await ensurePage()
    const buf = await p.screenshot({ fullPage })
    return {
      content: [
        { type: "text", text: `screenshot (${buf.length} bytes)` },
        { type: "image", mimeType: "image/png", data: buf.toString("base64") },
      ],
    }
  }
)

server.tool(
  {
    name: "playwright_close",
    description: "Close browser",
    inputSchema: z.object({}),
  },
  async () => {
    if (browser) {
      await browser.close()
      browser = null
      page = null
    }
    return { content: [{ type: "text", text: "closed" }] }
  }
)

const transport = new StdioServerTransport()
server.connect(transport).catch((err) => {
  console.error("MCP server failed:", err)
  process.exit(1)
})


