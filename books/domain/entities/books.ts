import { Level } from "../../../prisma/generated/enums";
import { BookCover } from "../../../shared/types/bookTypes/bookTypes";
import { ContentBook } from "../../../shared/types/bookTypes/contentBookTypes";


export class Books {
  constructor(
    public title: string,
    public summary: string,
    public synopsis: string,

    public language: string,
    public available: boolean,

    public yearBook: string,

    public genre: string,
    public level: Level,

    public format: string,
    public fileExtension: string,

    public contentBookId: string,
    public contentBookUrl: string,

    public coverImageId: string,
    public coverImageUrl: string,

    public theme: string[],
    public subgenre: string[],

    // relación (Prisma many-to-many o relación intermedia)
    public authorIds: string[],

    public totalPages?: number,
    public duration?: number,
    public anthology?: boolean
  ) { }
}