import { LoaderFunctionArgs } from "@remix-run/node";
import { logout } from "~/services/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  return logout(request);
} 