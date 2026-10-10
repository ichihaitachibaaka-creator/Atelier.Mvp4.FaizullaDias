// Edge function: generate-pattern — requires JWT authentication (verify_jwt = true)
// Rate limited: 20 requests per minute per IP address
import { VMeasurements } from "./VMeasurements.js";
import { generatePatternSVG } from "./PatternGenerator.js";
import { AVAILABLE_STYLES, normalizeStyle } from "./PatternConfigs.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Measurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
}

interface RequestBody {
  measurements: Measurements;
  tshirtType?: string;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MEASUREMENT_RANGES = {
  height: { min: 100, max: 250, label: "Рост" },
  chest: { min: 50, max: 200, label: "Обхват груди" },
  waist: { min: 40, max: 180, label: "Обхват талии" },
  hips: { min: 50, max: 200, label: "Обхват бёдер" },
};

function validateMeasurements(m: Measurements): string | null {
  for (const [key, range] of Object.entries(MEASUREMENT_RANGES)) {
    const val = m[key as keyof Measurements];
    if (typeof val !== "number" || isNaN(val)) {
      return `${range.label} должен быть числом.`;
    }
    if (val <= 0) {
      return `${range.label} должен быть больше 0.`;
    }
    if (val < range.min || val > range.max) {
      return `${range.label} должен быть в диапазоне ${range.min}–${range.max} см.`;
    }
  }
  return null;
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get("SUPABASE_ANON_KEY") || ""));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_BEFORE_MS = 5 * 60_000;

async function checkRateLimit(ipHash: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  const now = Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS).toISOString();
  const cleanupBefore = new Date(now - CLEANUP_BEFORE_MS).toISOString();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
  };

  try {
    await fetch(`${supabaseUrl}/rest/v1/rate_limit_log?id=lt.0&endpoint=eq.generate-pattern&created_at=lt.${encodeURIComponent(cleanupBefore)}`, {
      method: "DELETE",
      headers,
    });

    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/rate_limit_log?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&endpoint=eq.generate-pattern&created_at=gte.${encodeURIComponent(windowStart)}`,
      { headers: { ...headers, "Range-Unit": "items", Range: "0-0", "Prefer": "count=exact" } },
    );

    const count = countRes.headers.get("content-range");
    let currentCount = 0;
    if (count) {
      const match = count.match(/(\d+)$/);
      if (match) currentCount = parseInt(match[1], 10);
    }

    if (currentCount >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0 };
    }

    await fetch(`${supabaseUrl}/rest/v1/rate_limit_log`, {
      method: "POST",
      headers: { ...headers, "Prefer": "return=minimal" },
      body: JSON.stringify({ ip_hash: ipHash, endpoint: "generate-pattern" }),
    });

    return { allowed: true, remaining: RATE_LIMIT_MAX - currentCount - 1 };
  } catch {
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const ipHash = await hashIP(clientIP);
    const rateCheck = await checkRateLimit(ipHash);

    if (!rateCheck.allowed) {
      return jsonResponse(
        {
          success: false,
          error: "Слишком много запросов. Попробуйте через минуту.",
          rate_limited: true,
        },
        429,
      );
    }

    const body: RequestBody = await req.json();

    if (!body.measurements) {
      return jsonResponse({ success: false, error: "Не переданы мерки." }, 400);
    }

    const m = body.measurements;
    if (m.height === undefined || m.chest === undefined || m.waist === undefined || m.hips === undefined) {
      return jsonResponse(
        { success: false, error: "Все мерки (рост, обхват груди, талия, бёдра) обязательны." },
        400,
      );
    }

    const validationError = validateMeasurements(m);
    if (validationError) {
      return jsonResponse({ success: false, error: validationError }, 400);
    }

    const style = normalizeStyle(body.tshirtType);
    if (!style) {
      return jsonResponse(
        {
          success: false,
          error: `Неизвестный тип изделия "${body.tshirtType}".`,
          allowed: AVAILABLE_STYLES,
        },
        400,
      );
    }

    let report: string;
    let svgCode: string;
    let params: ReturnType<VMeasurements["toParams"]>;

    try {
      const vm = new VMeasurements({
        height: m.height,
        chest: m.chest,
        waist: m.waist,
        hips: m.hips,
        tshirtType: style,
      });
      report = vm.toReport();
      params = vm.toParams();
    } catch (calcErr) {
      return jsonResponse(
        { success: false, error: `Ошибка расчёта: ${calcErr instanceof Error ? calcErr.message : String(calcErr)}` },
        500,
      );
    }

    try {
      svgCode = generatePatternSVG(params, style);
    } catch (svgErr) {
      return jsonResponse(
        { success: false, error: `Ошибка генерации SVG: ${svgErr instanceof Error ? svgErr.message : String(svgErr)}` },
        500,
      );
    }

    return jsonResponse({
      success: true,
      style,
      prompt: report,
      svg: svgCode,
      rate_limit_remaining: rateCheck.remaining,
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : "Внутренняя ошибка сервера." },
      500,
    );
  }
});
