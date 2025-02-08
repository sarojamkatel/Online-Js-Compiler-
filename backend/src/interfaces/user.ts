import { ROLE } from "../enums/role";

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: ROLE;
}
export interface GetUserQuery {
  q?: string;
}
export interface GetUserQueryPage extends GetUserQuery {
  page?: number;
  size?: number;
  limit?: number;
}
