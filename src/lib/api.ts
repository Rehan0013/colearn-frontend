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
export const chatApi = createInstance(process.env.NEXT_PUBLIC_REALTIME_URL!);

// ── Auto refresh token on 401 with Queue ──────────────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const withRefresh = (instance: ReturnType<typeof createInstance>) => {
    instance.interceptors.response.use(
        (res) => res,
        async (error) => {
            const original = error.config;
            if (error.response?.status === 401 && !original._retry) {
                if (isRefreshing) {
                    // Queue the request until token is refreshed
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(() => instance(original))
                        .catch((err) => Promise.reject(err));
                }

                original._retry = true;
                isRefreshing = true;

                try {
                    await authApi.post("/api/auth/refresh-token");
                    processQueue(null, "success");
                    return instance(original);
                } catch (err) {
                    processQueue(err, null);
                    // Refresh failed — redirect to login
                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
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
withRefresh(chatApi);
