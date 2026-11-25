import type { Handle } from "@sveltejs/kit";
import { currentUser } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    event.locals.user = await currentUser(event);
  } catch {
    event.locals.user = null;
  }
  return resolve(event);
};
