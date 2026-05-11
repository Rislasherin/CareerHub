import bcrypt from "bcrypt";
import { IBcryptService } from "@application/interfaces/IBcryptService";

export class BcryptService implements IBcryptService {
  private readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
