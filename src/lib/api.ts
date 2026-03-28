import axios from "axios";

const createInstance = (baseURL: string) =>
    axios.create({
        baseURL,
        withCredentials: true, // send cookies with every request
        headers: { "Content-Type": "application/json" },
    });

// ── One axios instance per microservice ───────────────────────────────────────
export const authApi   = createInstance(process.env.NEXT_PUBLIC_AUTH_URL!);
export const roomApi   = createInstance(process.env.NEXT_PUBLIC_ROOM_URL!);
export const notesApi  = createInstance(process.env.NEXT_PUBLIC_NOTES_URL!);
export const sessionApi = createInstance(process.env.NEXT_PUBLIC_SESSION_URL!);

// ── Auto refresh token on 401 ─────────────────────────────────────────────────
const withRefresh = (instance: ReturnType<typeof createInstance>) => {
    instance.interceptors.response.use(
        (res) => res,
        async (error) => {
            const original = error.config;
            if (error.response?.status === 401 && !original._retry) {
                original._retry = true;
                try {
                    await authApi.post("/api/auth/refresh-token");
                    return instance(original);
                } catch {
                    // Refresh failed — redirect to login
                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                }
            }
            return Promise.reject(error);
        }
    );
    return instance;
};

// Apply refresh interceptor to all instances
withRefresh(authApi);
withRefresh(roomApi);
withRefresh(notesApi);
withRefresh(sessionApi);
