import { Request, Response } from "express";
import { FindProgresByID } from "../../aplication/service/FindById.Service";
import { FindProgressPostgres } from "../../infrastructure/bookProgressRepoMongo";



const findProgresMongo = new FindProgressPostgres
const findProgress = new FindProgresByID(findProgresMongo)


export const findByProgressIdControllers = async (req: Request, res: Response) => {
    try {
        const id = req.user?.id;
        const result = await findProgress.findByUser(id)
        if (!result) {
            res.status(404).json({ msg: 'the progress user not found' })
        }
        res.status(200).json({ result })
    } catch (error) {
        console.log('the server error', error)
        res.status(500).json({ msg: 'the internal server error' })
    }
}
export const findProgressByBook = async (req: Request, res: Response) => {
    try {
        const idUser = req.user?.id;
        const idBook = req.params.id;

        const result = await findProgress.findByBook(idBook, idUser)
        if (!result) {
            res.status(404).json({ msg: 'the progress user not found' })
        }
        res.status(200).json({ result })
    } catch (error) {
        console.log('the server error', error)
        res.status(500).json({ msg: 'the internal server error' })

    }
}
