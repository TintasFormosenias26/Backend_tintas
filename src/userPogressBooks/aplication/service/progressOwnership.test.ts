import assert from "node:assert/strict";
import test from "node:test";
import { UpdateProgressService } from "./UpdateProgress.Service";
import { DeleteProgresService } from "./DeleteProgress.Service";
import type { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import type { FindProgressPort } from "../../domain/ports/findProgres";
import type { UpdateProgresPort } from "../../domain/ports/updateProgressPort";
import type { deleteProgress } from "../../domain/ports/deleteProgress.Ports";

const progress = { id: "progress-b", idUser: "user-b", status: "reading", percent: 10 } as unknown as BookUserProgresRepo;

class MemoryProgressRepository implements FindProgressPort, UpdateProgresPort, deleteProgress {
  public updated = false;
  public deleted = false;

  async findByUser(userId: string) { return userId === "user-b" ? [progress] : []; }
  async findByBook(_bookId: string, userId: string) { return this.findByUser(userId); }
  async findById(id: string, userId: string) { return id === "progress-b" && userId === "user-b" ? progress : null; }
  async updateProgres(id: string, userId: string) {
    if (id !== "progress-b" || userId !== "user-b") return null;
    this.updated = true;
    return progress;
  }
  async deleteProgres(id: string, userId: string) {
    if (id !== "progress-b" || userId !== "user-b") return false;
    this.deleted = true;
    return true;
  }
}

test("un usuario no puede consultar ni actualizar el progreso de otro", async () => {
  const repository = new MemoryProgressRepository();
  assert.equal(await repository.findById("progress-b", "user-a"), null);

  const service = new UpdateProgressService(repository, repository);
  assert.equal(await service.updateProgres("progress-b", "user-a", { percent: 50 }), null);
  assert.equal(repository.updated, false);
});

test("un usuario no puede eliminar el progreso de otro", async () => {
  const repository = new MemoryProgressRepository();
  const service = new DeleteProgresService(repository);
  assert.equal(await service.deleteProgres("progress-b", "user-a"), false);
  assert.equal(repository.deleted, false);
});
