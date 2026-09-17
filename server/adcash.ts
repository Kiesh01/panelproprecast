// Adcash API Cache and Client Helper
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

const DEFAULT_API_TOKEN =
  "rSbur+rv1uFcWuWSJ2c9OfZ07LtUjSL4B3hJLTmiNkQ9N2doMyIh1vECeXa09EVvix3OhNooN3i2pJfnxU2v/EAoZ78+KNZ/UdrFqJULRHhpQOqGQZpBvSI5wwgABNDdcFfahCvTxPXZqhtgT9vk9g==";

export async function getAdcashAccessToken(customToken?: string): Promise<string> {
  const tokenToUse = customToken || process.env.ADCASH_API_TOKEN || DEFAULT_API_TOKEN;

  // If using default/env token and existing cached token is valid with at least 60s buffer, reuse it
  if (!customToken && cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const response = await fetch("https://adcash.myadcash.com/api/v2/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "PanelPro-Publisher-Client/1.0",
    },
    body: JSON.stringify({ api_token: tokenToUse }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate with Adcash API (${response.status}): ${errorText}`);
  }

  const json: any = await response.json();
  const accessToken = json?.data?.access_token;
  const expiresInSeconds = json?.data?.expires_in || 900;

  if (!accessToken) {
    throw new Error("Invalid response from Adcash auth endpoint: access_token not found");
  }

  if (!customToken) {
    cachedAccessToken = accessToken;
    tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  }

  return accessToken;
}

export async function fetchAdcashReports(params: {
  startDate: string;
  endDate: string;
  groupBy?: string;
  customToken?: string;
}) {
  const accessToken = await getAdcashAccessToken(params.customToken);

  const groupBy = params.groupBy || "date,zone";
  const url = new URL("https://adcash.myadcash.com/api/v2/publishers/reports");
  url.searchParams.set("start_date", params.startDate);
  url.searchParams.set("end_date", params.endDate);
  url.searchParams.set("group_by", groupBy);

  const reportResponse = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!reportResponse.ok) {
    const errorText = await reportResponse.text();
    throw new Error(`Adcash reporting error (${reportResponse.status}): ${errorText}`);
  }

  return await reportResponse.json();
}

export async function fetchAdcashBalance(customToken?: string) {
  const accessToken = await getAdcashAccessToken(customToken);

  const balanceResponse = await fetch("https://adcash.myadcash.com/api/v2/publishers/balance", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!balanceResponse.ok) {
    const errorText = await balanceResponse.text();
    throw new Error(`Adcash balance error (${balanceResponse.status}): ${errorText}`);
  }

  return await balanceResponse.json();
}

// Anti-Adblock library caching (refreshed periodically, cached for at least 10 minutes)
let cachedAdblockScript: string | null = null;
let adblockScriptExpiresAt: number = 0;

export async function getAntiAdblockScript(): Promise<string> {
  const now = Date.now();
  if (cachedAdblockScript && now < adblockScriptExpiresAt) {
    return cachedAdblockScript;
  }

  try {
    const response = await fetch("https://adbpage.com/adblock?v=3&format=js", {
      headers: {
        "User-Agent": "PanelPro-AdcashAntiAdblock/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`adbpage status ${response.status}`);
    }

    const scriptContent = await response.text();
    if (scriptContent && scriptContent.length > 1000) {
      cachedAdblockScript = scriptContent;
      // Cache for 10 minutes (600,000 ms)
      adblockScriptExpiresAt = now + 10 * 60 * 1000;
      return cachedAdblockScript;
    }
  } catch (err) {
    console.error("[Anti-Adblock Fetch Error]:", err);
    // If cache already exists, return stale cache rather than failing
    if (cachedAdblockScript) {
      return cachedAdblockScript;
    }
  }

  return cachedAdblockScript || "";
}

