export interface deleteProgress {
    deleteProgres(id: string, userId: string): Promise<boolean>
}
