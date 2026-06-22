import { photoProfile } from "../../../shared/types/photo.Types";
import { UserType } from "../../../userService/domain/entities/UserTypes";

//dates of user
export class AvatarType {
  constructor(
    public idImage: string,
    public urlSecura: string,
    public gender: string,
    public users?: UserType[],
    createdAt?: Date,
    updatedAt?: Date | any
  ) { }
}
