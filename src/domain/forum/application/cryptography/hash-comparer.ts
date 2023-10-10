export abstract class Hasher {
  abstract compare(plain: string, hash: string): Promise<boolean>
}
