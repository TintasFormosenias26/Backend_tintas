import { Level } from "../../../prisma/generated/enums";
import { BookCover } from "../../../shared/types/bookTypes/bookTypes";
import { ContentBook } from "../../../shared/types/bookTypes/contentBookTypes";


export class BookSearchType {
    constructor(
        public title?: string,
        public synopsis?: string,

        public language?: string,
        public available?: boolean,

        public yearBook?: string,

        public genre?: string,
        public level?: Level,

        public format?: string,
        public theme?: string[],
        public subgenre?: string[],
        public authorName?: string,
        public anthology?: boolean
    ) { }
}