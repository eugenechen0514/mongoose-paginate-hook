/**
 *
 * Test step:
 *    1. Run mongodb server by docker.
 *    ```
 *    $ docker run --rm -p 27017:27017 mongo:4.0
 *    ```
 *    2 Check mongodb server is running
 *    ```
 *    $ mongo
 *    ```
 *    3. Run this test file
 *    ```
 *    node hookFunction.js
 *    ```
 */


// Imports
const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongoosePaginateHook = require('../dist/commonjs');

// Hook functions
function afterPaginationFunction(result) {
    return {
        data: result.docs, // Change 'docs' key to 'data' key
        pageIndex: result.page -1, // To change zero-base
        pages: result.pages,
    };
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

(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test', { useNewUrlParser: true });

    // Arrange fake data
    await BookModel.deleteMany({});
    await BookModel.insertMany([
        {name: 'book1'},
        {name: 'book2'},
        {name: 'book3'},
        {name: 'book4'},
        {name: 'book5'},
    ]);

    // Use paginate
    let result = await BookModel.paginate( // page1: {name: 'book1'}, {name: 'book2'}
        {},
        {
            page: {
                number: 0,
                size: 2,
            }
        });
    console.log(JSON.stringify(result));

    result = await BookModel.paginate( // page2: {name: 'book3'}, {name: 'book4'}
        {},
        {
            page: {
                number: 1,
                size: 2,
            }
        });
    console.log(JSON.stringify(result));

    result = await BookModel.paginate( // page3: {name: 'book5'}}
        {},
        {
            page: {
                number: 2,
                size: 2,
            }
        });
    console.log(JSON.stringify(result));

    await mongoose.disconnect();
})().catch(console.error);
