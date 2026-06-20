export class Author {
  constructor(
    public readonly fullName: string,
    public readonly biography: string,
    public readonly profession: string,
    public readonly birthdate: string | Date,
    public readonly birthplace: string,
    public readonly nationality: string,
    public readonly isActive: boolean,
    public readonly writingGenre: string[],
    public readonly photoIdImage?: string,
    public readonly photoUrl?: string,
    public readonly id?: string,
  ) { }
}