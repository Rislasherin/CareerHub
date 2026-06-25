export interface IDeleteUserUseCase {
  execute(role: string, id: string): Promise<void>;
}
