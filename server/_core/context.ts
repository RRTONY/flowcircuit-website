import "server-only";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "../../drizzle/schema";
import { auth } from "@/lib/auth";
import { getUserByEmail } from "../db";

export type TrpcContext = {
  req: FetchCreateContextFnOptions["req"];
  user: User | null;
};

export async function createContext(opts: FetchCreateContextFnOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const session = await auth();
    if (session?.user?.email) {
      user = (await getUserByEmail(session.user.email)) ?? null;
    }
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return { req: opts.req, user };
}
