import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxy(request: any) {
  return auth(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
