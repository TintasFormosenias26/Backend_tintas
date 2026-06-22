
export class BookUserProgresRepo {
    constructor(
        public readonly idUser: string,
        public readonly idBook: string,
        public unit: "page" | "second" | "seconds" | "pages",
        public position: number,
        public percent: number,
        public total: number,
        public status: "reading" | "finished" | "pending" | "abandoned",
        public readonly startDate: Date,
        public finishDate: Date,
        public readonly UpdateLast: Date

    ) { }
}