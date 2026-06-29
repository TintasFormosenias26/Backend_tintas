import { Itoken } from "../types/Token.type";



export interface createToken {
    createToken(email: string): Promise<Itoken>
}