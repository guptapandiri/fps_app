const EPOS_TRANSACTIONS_URL =
  "https://aepos.ap.gov.in/Epos_Spring/fps/fpstransactionwitoutcatptcha";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Method not allowed" },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  try {
    const payload = await request.json();
    const { fps_id: fpsId, month, year } = payload ?? {};

    if (![fpsId, month, year].every((value) => typeof value === "string" && value.trim())) {
      return Response.json(
        { message: "fps_id, month, and year are required" },
        { status: 400 },
      );
    }

    const upstreamResponse = await fetch(EPOS_TRANSACTIONS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fps_id: fpsId, month, year }),
    });

    return new Response(await upstreamResponse.arrayBuffer(), {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to proxy ePoS transactions", error);
    return Response.json(
      { message: "Failed to fetch ePoS transactions" },
      { status: 502 },
    );
  }
};
