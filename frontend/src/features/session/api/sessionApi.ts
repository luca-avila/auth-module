import type { User } from "../../../entities/user/model/types";
import { request } from "../../../shared/api/httpClient";

export async function getCurrentUser(): Promise<User> {
  return request<User>("GET", "/users/me");
}

