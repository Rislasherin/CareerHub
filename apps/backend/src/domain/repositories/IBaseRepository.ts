export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  count(filter: any): Promise<number>;
}
