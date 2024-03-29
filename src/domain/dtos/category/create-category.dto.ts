

export class CreateCategoryDto {
  private constructor(
    public readonly name: string,
    public readonly available: boolean
  ) {}

  static create(obj: { [key: string]: any }): [string?, CreateCategoryDto?] {
    const { name, available = false } = obj;
    let availableBoolean = available;

    if (!name) return ["Missing name"];

    if (typeof available !== "boolean") {
      availableBoolean = (available === "true"); //* Se hace una comparacion de string, que devuelve un boolean.
    }

    return [ undefined, new CreateCategoryDto( name, availableBoolean ) ];
  }
}
