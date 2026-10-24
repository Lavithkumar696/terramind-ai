// TerraMind AI — disaster analyst edge function
// Distinguishes verified facts from estimates and includes inline source citations.

interface ContextEvent {
  title?: string;
  source?: string;
  timestamp?: string;
  location?: { lat: number; lon: number };
  severity?: string;
  category?: string;
  magnitude?: number;
  magnitudeUnit?: string;
  depthKm?: number;
  felt?: number;
  tsunamiAlert?: boolean;
  alertLevel?: string;
  significance?: number;
  place?: string;
  country?: string;
  region?: string;
  sourceLinks?: { label: string; url: string }[];
  sourceUrl?: string;
  verified?: boolean;
  description?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const question: string = (body?.question ?? "").toString().trim();
    const rawEvents: unknown[] = Array.isArray(body?.contextEvents) ? body.contextEvents : [];

    if (!question) {
      return new Response(
        JSON.stringify({ error: "A question is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contextEvents = rawEvents.slice(0, 15) as ContextEvent[];

    // Build structured context: verified facts vs supporting data/estimates
    const { verifiedFacts, estimates, sources } = buildStructuredContext(contextEvents);
    const contextSummary = buildContextSummary(contextEvents);

    const provider = (Deno.env.get("AI_PROVIDER") ?? "openai").toLowerCase();
    const apiKey =
      Deno.env.get("AI_API_KEY") ??
      Deno.env.get("OPENAI_API_KEY") ??
      Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      const fallback = buildGroundedFallback(question, contextSummary, verifiedFacts, estimates, sources);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are TerraMind AI, a disaster intelligence analyst.

CRITICAL RULES:
- Separate VERIFIED FACTS (directly measured by instruments: coordinates, time, magnitude, depth) from ESTIMATES AND MODELS (PAGER alert levels, significance scores, felt report counts, impact projections).
- Every factual claim must include an inline citation in the format [Source, timestamp]. For example: "A magnitude 6.2 earthquake occurred at 35.67°N, 139.65°E [USGS, 2024-01-15T03:42:00Z]."
- If a data point is an estimate or model output, explicitly label it: "The USGS PAGER alert level is Yellow (estimated impact, not a direct measurement)."
- Never present predictions or model outputs as confirmed facts.
- If the context does not cover the question, say so explicitly rather than speculating.
- For severe weather or urgent danger, direct users to official authorities (national meteorological agencies, local emergency management, NOAA Tsunami Warning Centers).
- Be concise, calm, and factual. Use plain language.
- Do not fabricate events, magnitudes, locations, or timestamps.
- Structure your answer with clear sections when discussing specific events: use "Verified Facts:" and "Estimates & Models:" headers.`;

    const userPrompt = `Question: ${question}

VERIFIED FACTS FROM FEEDS (instrument-measured, directly observable):
${verifiedFacts || "No verified facts available in context."}

SUPPORTING DATA & ESTIMATES (model outputs, indirect indicators):
${estimates || "No estimates available in context."}

OFFICIAL SOURCES:
${sources || "No source links available."}

Answer the question grounded in the above context. Cite each fact inline as [Source, timestamp]. Clearly label any estimates or model outputs as such. If the question is outside this context, say so and provide general, clearly-labeled preparedness guidance.`;

    let answer: string;
    if (provider === "anthropic") {
      answer = await callAnthropic(apiKey, systemPrompt, userPrompt);
    } else {
      answer = await callOpenAI(apiKey, systemPrompt, userPrompt);
    }

    return new Response(
      JSON.stringify({
        answer,
        contextSummary,
        verifiedFacts,
        estimates,
        sources,
        grounded: true,
        provider,
        timestamp: new Date().toISOString(),
        notice:
          "This response is AI-generated and grounded in provided feed data. Verified facts are cited with source and timestamp. Estimates are labeled as such. For emergencies, follow official authorities.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "AI analyst request failed",
        grounded: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface StructuredContext {
  verifiedFacts: string;
  estimates: string;
  sources: string;
}

function buildStructuredContext(events: ContextEvent[]): StructuredContext {
  const factLines: string[] = [];
  const estimateLines: string[] = [];
  const sourceLines: string[] = [];

  for (const e of events) {
    const time = e.timestamp ?? "unknown time";
    const src = e.source ?? "unknown";
    const loc = e.location
      ? `${e.location.lat.toFixed(2)}°, ${e.location.lon.toFixed(2)}°`
      : "unknown location";
    const place = [e.place, e.country].filter(Boolean).join(", ") || loc;

    // Verified facts: directly measured by instruments
    factLines.push(
      `- ${e.title ?? "Unknown event"} [${src}, ${time}]: ` +
        `Location: ${place} (${loc}). ` +
        (e.magnitude !== undefined ? `Magnitude: ${e.magnitude}${e.magnitudeUnit ? ' ' + e.magnitudeUnit : ''} (instrument-measured). ` : "") +
        (e.depthKm !== undefined ? `Depth: ${e.depthKm} km (measured from seismic data). ` : "") +
        `Category: ${e.category ?? "unknown"}. Severity: ${e.severity ?? "unknown"}.`
    );

    // Estimates & models: not directly measured
    const estParts: string[] = [];
    if (e.alertLevel) {
      estParts.push(
        `PAGER alert level: ${e.alertLevel} (automated impact assessment, not a direct measurement — Green=minimal, Yellow=moderate, Orange=significant, Red=destructive)`
      );
    }
    if (e.significance !== undefined && e.significance > 0) {
      estParts.push(
        `Significance score: ${e.significance} (USGS composite metric combining magnitude, felt reports, and damage estimates)`
      );
    }
    if (e.felt !== undefined && e.felt > 0) {
      estParts.push(
        `Felt reports: ${e.felt} (subjective "Did You Feel It?" submissions, not a damage assessment)`
      );
    }
    if (e.tsunamiAlert) {
      estParts.push(
        `Tsunami flag: active (USGS evaluation triggered — follow NOAA Tsunami Warning Center guidance)`
      );
    }
    if (estParts.length > 0) {
      estimateLines.push(`- ${e.title ?? "Unknown event"} [${src}]: ${estParts.join(". ")}.`);
    }

    // Source links
    if (e.sourceLinks && e.sourceLinks.length > 0) {
      for (const link of e.sourceLinks) {
        sourceLines.push(`- ${link.label}: ${link.url} [${src}]`);
      }
    } else if (e.sourceUrl) {
      sourceLines.push(`- ${e.title ?? "Event"}: ${e.sourceUrl} [${src}]`);
    }
  }

  return {
    verifiedFacts: factLines.join("\n"),
    estimates: estimateLines.join("\n"),
    sources: sourceLines.join("\n"),
  };
}

function buildContextSummary(events: ContextEvent[]): string {
  if (events.length === 0) return "";
  const lines: string[] = [];
  for (const e of events) {
    lines.push(
      `- ${e.title ?? "Unknown event"} | source: ${e.source ?? "unknown"} | ` +
        `time: ${e.timestamp ?? "unknown"} | location: ${JSON.stringify(e.location ?? {})} | ` +
        `severity: ${e.severity ?? "unknown"} | category: ${e.category ?? "unknown"}` +
        (e.magnitude ? ` | magnitude: ${e.magnitude}` : "") +
        (e.depthKm !== undefined ? ` | depth: ${e.depthKm}km` : "") +
        (e.alertLevel ? ` | pager: ${e.alertLevel}` : "") +
        (e.felt ? ` | felt: ${e.felt}` : "")
    );
  }
  return lines.join("\n");
}

function buildGroundedFallback(
  question: string,
  context: string,
  verifiedFacts: string,
  estimates: string,
  sources: string,
): {
  answer: string;
  grounded: boolean;
  contextSummary: string;
  verifiedFacts: string;
  estimates: string;
  sources: string;
  notice: string;
} {
  let answer = "I'm operating in data-grounded summary mode because no AI provider key is configured.\n\n";

  if (verifiedFacts) {
    answer += "VERIFIED FACTS FROM FEEDS (instrument-measured):\n";
    answer += verifiedFacts + "\n\n";
  }

  if (estimates) {
    answer += "SUPPORTING DATA & ESTIMATES (model outputs, not direct measurements):\n";
    answer += estimates + "\n\n";
  }

  if (sources) {
    answer += "OFFICIAL SOURCES:\n";
    answer += sources + "\n\n";
  }

  if (context) {
    answer += `Regarding your question "${question}": I can only summarize the verified events above. `;
    answer += "Each fact is cited with its source and timestamp for verification. ";
    answer += "Estimates and model outputs are labeled as such — they are not direct measurements.\n\n";
  } else {
    answer += "No specific event context was provided.\n\n";
  }

  answer += "For emergencies or urgent danger, always follow official authorities — your national meteorological agency and local emergency management. This response is generated from feed data only and is not a prediction.";

  return {
    answer,
    grounded: true,
    contextSummary: context,
    verifiedFacts,
    estimates,
    sources,
    notice: "Data-grounded summary mode (no AI provider configured). Verified facts are cited with source and timestamp. For emergencies, follow official authorities.",
  };
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("AI_MODEL") ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI provider error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "No response generated.";
}

async function callAnthropic(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("AI_MODEL") ?? "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI provider error: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data?.content?.[0]?.text ?? "No response generated.";
}
