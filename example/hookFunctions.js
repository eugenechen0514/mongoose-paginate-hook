// Imports
const mongoosePaginate = require('mongoose-paginate');
const mongoosePaginateHook = require('../index');

// Hook functions
function afterPaginationFunction(result) {
    // Change 'docs' key to 'data' key
    result.data = result.docs;
    delete result.docs;

    result.pageIndex = result - 1; // to change zero-base
    return result;
}

/**
 * @param query
 * @param paginateFunction
 * @param {{page: {number, size}}} paginationOptions
 * @return {*}
 */
function beforePaginationFunction(paginateFunction, query = {}, paginationOptions) {
    const pageIndex = Number(paginationOptions.page.number) + 1; // change to zero-base
    const pageSize =  Number(paginationOptions.page.size);

    return paginateFunction(query, {page: pageIndex, limit: pageSize}); // should return paginateFunction(...)
}

// Define book schema and use plugin
const BookSchema = new Schema({
    name: {type: String, required: true},
});
BookSchema.plugin(mongoosePaginate); // add paginate method
BookSchema.plugin(mongoosePaginateHook({ beforePaginationFunction, afterPaginationFunction})); // hook functions

// Model
const BookModel = mongoose.model('Book', BookSchema);

// Use paginate
BookModel.paginate(
    {},
    {
        page: {
            number: 1,
            size: 15,
        }
    });
