import { Request, Response } from "express";
import { FindAndDeleteUser, FindByID } from "../../application/service/FindAndDelete.service";
import { FindAndDeleteRepo, FindByIdRepo } from "../../domain/ports/FindAndDeleteRepo";
import { findAndDeleteMongo, UserFindById } from "../../infrastructure/userRespositoryMongo";

const findAndDeleteUser: FindAndDeleteRepo = new findAndDeleteMongo();
const findAndDelService: FindAndDeleteUser = new FindAndDeleteUser(findAndDeleteUser);
const findUserByIdPrisma: FindByIdRepo = new UserFindById()
const findUserService: FindByID = new FindByID(findUserByIdPrisma)



export const findUser = async (req: Request, res: Response) => {
  try {
    const users = await findAndDelService.findUser();
    console.log(users);
    res.status(200).json({ msg: "the users", users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.user?.id;
  try {
    const Result = await findAndDelService.deleteUser(id)
    if (!Result) {
      res.status(302).json({ msg: "user not delete" })
    }
    res.status(200).json({ msg: "user delete successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", error });
  }


};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) return res.status(400).json({ message: "No user ID found" });
    if (id === req.user?.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta desde el panel." });
    }

    await findAndDelService.deleteUser(id);
    return res.status(200).json({ msg: "user delete successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal server error" });
  }
};
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.user?.id;

    const result = await findUserService.findByID(id);
    if (!result) {
      res.status(302).json({ msg: "user not found   " });
    }
    res.status(200).json({ msg: "user", result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", error });
  }
};

