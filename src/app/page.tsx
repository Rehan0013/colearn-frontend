import { redirect } from "next/navigation";

// Root redirects — middleware handles the actual auth guard
export default function RootPage() {
    redirect("/dashboard");
}
