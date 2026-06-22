import { AvatarType } from "../../../avatars/domain/entities/AvatarsTypes";
import { BookProgress, Preference, Role } from "../../../prisma/generated/client";

//dates of user
export class UserType {
  public id: any;
  constructor(
    public name: string,
    public lastName: string,
    public userName: string,
    public birthDate: Date,
    public email: string,
    public password: string,
    public level: string,
    public imgLevel: string | null,
    public rol: Role,
    public point: number,
    public avatar: string,
    public preference?: Preference | null,
    public progresses?: BookProgress[],
  ) { }
}

export interface UpdateUserDTO {
  name?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  password?: string;
  birthDate?: Date;
  nivel?: string | null;
  imgLevel?: string | null;
  point?: number;
  avatar?: string;
}