
export class BookContent {
  constructor(public bookId: string, public title: string, public text: { page: number; content: string }[]) { }
}
