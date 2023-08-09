import { User } from "../entities/user.entity";

export interface ILoginResponse {
    user: User,
    token: string
}