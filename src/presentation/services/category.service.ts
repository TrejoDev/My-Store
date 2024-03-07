import { CategoryModel } from "../../data";
import { CreateCategoryDto, CustomError, PaginationDto, UserEntity } from "../../domain";

export class CategoryService {
  constructor() {}

  public async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: UserEntity
  ) {
    const categoryExist = await CategoryModel.findOne({ name: createCategoryDto.name });
    if (categoryExist) throw CustomError.badRequest("Category already exists");

    try {
      const category = new CategoryModel({
        ...createCategoryDto,
        user: user.id,
      });

      await category.save();
      return {
        id: category.id,
        name: category.name,
        available: category.available,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async getCategories( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    try {
        // const total = await CategoryModel.countDocuments();
        // const categories = await CategoryModel.find()
        //     .skip( ( page - 1 ) * limit )  // skip: saltarme una cantidad de registros. Toma como pagina 1 la posicion 0. Saltate los primeros #
        //     .limit( limit )

        const [ total, categories ] = await Promise.all([
            CategoryModel.countDocuments(),
            CategoryModel.find()
             .skip( ( page - 1 ) * limit )
             .limit( limit )
        ]);

        // const categories = dbCategories.reduce((categories: { id: Types.ObjectId; name: string; available: boolean }[], { _id, name, available }) => {
        //     categories.push({ id: _id, name, available });
        //     return categories;
        // }, []);

        return {
            page,
            limit,
            total,
            next: `/api/categories?page=${ page + 1 }&limit=${ limit }`,
            prev: ( page - 1 > 0 ) ? `/api/categories?page=${ page - 1 }&limit=${ limit }` : null,


            categories : categories.map( category => ({
                id: category.id,
                name: category.name,
                available: category.available
            }))
        }
    } catch (error) {
        throw CustomError.internalServer("Internal server error");
    }
  }
}
