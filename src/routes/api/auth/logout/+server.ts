import { json } from "@sveltejs/kit";
import { destroySession } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  try {
    await destroySession(event);
    return json({ ok: true });
  } catch {
    return json({ error: "Sign-out is temporarily unavailable." }, { status: 503 });
  }
};
