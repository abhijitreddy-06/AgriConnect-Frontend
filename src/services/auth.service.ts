import { apiRequest } from "@/services/http";

export type AuthRole = "farmer" | "customer";

export interface AuthUser {
  id?: string;
  username?: string;
  phone?: string;
  role?: AuthRole;
  deliveryAddress?: string | null;
  delivery_address?: string | null;
  profileComplete?: boolean;
}

export interface AuthSession {
  user: AuthUser | null;
  role: AuthRole | null;
  profileComplete: boolean;
}

export interface LoginPayload {
  phone: string;
  password: string;
  role: AuthRole;
}

export interface SignupPayload {
  username: string;
  phone: string;
  password: string;
  role: AuthRole;
}

export interface UpdateProfilePayload {
  username: string;
  delivery_address?: string | null;
}

type ApiAuthEnvelope = {
  user?: AuthUser;
  role?: AuthRole;
  profileComplete?: boolean;
  data?: {
    user?: AuthUser;
    role?: AuthRole;
    profileComplete?: boolean;
  };
};

const normalizeUser = (user?: AuthUser | null): AuthUser | null => {
  if (!user) return null;

  const normalizedAddress = user.deliveryAddress ?? user.delivery_address ?? null;

  return {
    ...user,
    deliveryAddress: normalizedAddress,
    delivery_address: normalizedAddress,
  };
};

const normalizeAuthSession = (payload?: ApiAuthEnvelope | null): AuthSession => {
  const source = payload?.data ?? payload ?? {};
  const user = normalizeUser(source.user ?? null);
  const role = source.role ?? user?.role ?? null;
  const profileComplete = Boolean(source.profileComplete ?? user?.profileComplete ?? user?.deliveryAddress);

  return {
    user,
    role,
    profileComplete,
  };
};

export const authService = {
  async login(data: LoginPayload): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthEnvelope>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeAuthSession(payload);
  },

  async signup(data: SignupPayload): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthEnvelope>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeAuthSession(payload);
  },

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  async getSession(): Promise<AuthSession> {
    const payload = await apiRequest<ApiAuthEnvelope>("/auth/verify", {
      method: "GET",
    });
    return normalizeAuthSession(payload);
  },

  async updateProfile(data: UpdateProfilePayload): Promise<AuthUser> {
    const payload = await apiRequest<{ data?: { user?: AuthUser }; user?: AuthUser }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return normalizeUser(payload.data?.user ?? payload.user ?? null) ?? {};
  },
};
