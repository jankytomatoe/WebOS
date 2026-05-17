import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json());

  // Proxy Endpoint: This is the "Engine" of our browser
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        }
      });

      const contentType = response.headers.get("content-type") || "";
      
      // Get the body as an array buffer to handle both text and binary
      const buffer = await response.arrayBuffer();
      let body = Buffer.from(buffer);

      // Strip headers that prevent framing
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", contentType);
      
      // Clear security headers from the upstream site
      const headersToStrip = ["content-security-policy", "x-frame-options", "frame-options", "x-content-type-options"];
      headersToStrip.forEach(h => res.removeHeader(h));

      if (contentType.includes("text/html")) {
        let html = body.toString();
        // Inject a base tag to help with relative assets
        const origin = new URL(targetUrl).origin;
        html = html.replace(/<head>/i, `<head><base href="${targetUrl}">`);
        
        // Naive URL rewriting for links to stay in proxy
        html = html.replace(/href="(\/(?!\/)[^"]+)"/g, `href="/api/proxy?url=${encodeURIComponent(origin)}$1"`);
        
        res.send(html);
      } else {
        res.send(body);
      }
    } catch (error: any) {
      res.status(500).send(`Proxy Error: ${error.message}`);
    }
  });

  // Hyperbeam session endpoint
  app.post("/api/hyperbeam/session", async (req, res) => {
    const apiKey = (process.env.HYPERBEAM_API_KEY || "sk_test_wYGcle_1MWuuC41dDKhQDsjpnRTIUs0kFinaWqgtD5c").trim();
    const startUrl = req.body.start_url || "https://google.com";
    
    // Check if the key looks like a placeholder
    const isPlaceholder = apiKey.startsWith("sk_test_wY") || apiKey.startsWith("sk_test_qU");
    
    console.log(`[Hyperbeam] Creating session. Key prefix: ${apiKey.substring(0, 10)}...`);
    
    // --- CACHE LAYER: To prevent Rate Limit (429) during frequent Dev reloads ---
    const cachePath = path.join(process.cwd(), ".hyperbeam-cache.json");
    try {
      if (fs.existsSync(cachePath)) {
        const cacheRaw = fs.readFileSync(cachePath, "utf-8");
        const cache = JSON.parse(cacheRaw);
        // Cache for 6 hours (Hyperbeam instances idle out, but the URL might still embed)
        if (cache[startUrl] && cache[startUrl].timestamp > Date.now() - 1000 * 60 * 60 * 6) {
          console.log(`[Hyperbeam] Returning cached VM session to avoid rate-limits for ${startUrl}`);
          return res.json(cache[startUrl].data);
        }
      }
    } catch(e) {
      // Ignore cache errors
    }
    
    try {
      // Possible Hyperbeam endpoints in order of preference
      // engine.hyperbeam.com is the standard API domain. 
      // api.hyperbeam.com often points to the marketing site (Webflow).
      const endpoints = [
        "https://engine.hyperbeam.com/v0/vm",
      ];
      
      let lastResponse: Response | null = null;
      let lastErrorText = "";

      for (const endpoint of endpoints) {
        console.log(`[Hyperbeam] POST ${endpoint}`);
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              start_url: startUrl
            })
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`[Hyperbeam] Session created successfully via ${endpoint}`);
            
            // --- SAVE TO CACHE ---
            try {
              let cache: any = {};
              if (fs.existsSync(cachePath)) {
                cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
              }
              cache[startUrl] = { data, timestamp: Date.now() };
              fs.writeFileSync(cachePath, JSON.stringify(cache));
            } catch(e) {
              console.error("[Hyperbeam] Failed to write cache", e);
            }

            return res.json(data);
          } else if (response.status === 429) {
            console.log(`[Hyperbeam] Rate limited. Attempting to reuse an existing VM...`);
            try {
              const listRes = await fetch(endpoint, {
                headers: { "Authorization": `Bearer ${apiKey}` }
              });
              if (listRes.ok) {
                const listData = await listRes.json();
                if (listData.results && listData.results.length > 0) {
                  const vmId = listData.results[0].id;
                  const vmRes = await fetch(`${endpoint}/${vmId}`, {
                    headers: { "Authorization": `Bearer ${apiKey}` }
                  });
                  if (vmRes.ok) {
                    const vmData = await vmRes.json();
                    console.log(`[Hyperbeam] Reusing existing VM ${vmId}`);
                    return res.json(vmData);
                  }
                }
              }
            } catch (reuseErr) {
              console.error("[Hyperbeam] Failed to reuse existing VM", reuseErr);
            }
          }
          
          lastResponse = response;
          lastErrorText = await response.text();
          
          // Truncate and clean long HTML responses (e.g. from Webflow 404s)
          const errorPreview = lastErrorText.length > 100 
            ? lastErrorText.substring(0, 100).replace(/<[^>]*>?/gm, "").trim() + "..."
            : lastErrorText;
            
          console.warn(`[Hyperbeam] ${endpoint} failed with status ${response.status}: ${errorPreview}`);
          
          // Try next endpoint regardless of status (unless success)
        } catch (fetchErr: any) {
          console.error(`[Hyperbeam] Fetch error for ${endpoint}: ${fetchErr.message}`);
          lastErrorText = fetchErr.message;
        }
      }

      // If we are here, all endpoints failed
      const status = lastResponse?.status || 500;
      let message = `Hyperbeam API Error (Status ${status})`;
      
      if (status === 404) {
        message = "Hyperbeam API returned 404 (Not Found).";
      } else if (status === 429) {
        message = "Hyperbeam Rate Limit Exceeded. You are requesting too many VMs in a short period. Please wait a moment and try again.";
      } else if (status === 401 || status === 403) {
        message = "Hyperbeam Authentication failed. Your API key appears to be invalid or expired.";
      }

      if (isPlaceholder) {
        message += "\n\nCRITICAL: You appear to be using a Stripe placeholder key (sk_test_...) instead of a real Hyperbeam API key. Please obtain a key from hyperbeam.com/dashboard.";
      }
      
      throw new Error(message);
    } catch (error: any) {
      console.error(`[Hyperbeam Error] ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "running", kernel: "WebOS_Node_V1" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WebOS Browser Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
