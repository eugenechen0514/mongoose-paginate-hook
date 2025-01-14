# Mongoose paginate hook

IMPORTANT: [mongoose-paginate-v2](https://www.npmjs.com/package/mongoose-paginate-v2) is a recommended alternative to mongoose-paginate and mongoose-paginate-hook, both of which are outdated.  

Provide a schema plugin that can hook some functions to modify output and input for pagination method

# Dependency
* 2.0.0
    ```
    mongoose: 8.X.X
    ```
* 0.1.7
    ```
    mongoose: 5.X.X
    ```


# Usage

``` javascript
const mongoosePaginate = require('mongoose-paginate');
const mongoosePaginateHook = require('mongoose-paginate-hook');

// Define book schema and use plugins
const BookSchema = new Schema({
    name: {type: String, required: true},
});
BookSchema.plugin(mongoosePaginate); // add paginate method
BookSchema.plugin(mongoosePaginateHook({ beforePaginationFunction, afterPaginationFunction})); // hook functions
```
# API
import by `const mongoosePaginateHook = require('mongoose-paginate-hook');`

`mongoosePaginateHook(options)` where `options` has following properties:



| option  | type  | description  |
|-----|---|---|
| ***paginateFunctionName***      | `string`                                                               | pagination method name |
| ***afterPaginationFunction***   | `function(result: object): object`                                     | alter result. It is useful to change key name |
| ***beforePaginationFunction***  | `function(paginateFunction: function, [query], [options], [callback])` | alter pagination input. It is useful to change the original pagination function signature. ***paginateFunction*** is the original pagination method. **NOTE: you should `return paginateFunction(...)`**  |

# Example

``` javascript
// Imports
const mongoosePaginate = require('mongoose-paginate');
const mongoosePaginateHook = require('mongoose-paginate-hook');

// Hook functions
function afterPaginationFunction(result) {
    // Change 'docs' key to 'data' key
    result.data = result.docs;
    delete result.docs;

    result.pageIndex = result - 1; // to change zero-base
    return result;
}

/**
 *
 * new pagination method signature
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

// Define book schema and use plugins
const BookSchema = new Schema({
    name: {type: String, required: true},
});
BookSchema.plugin(mongoosePaginate); // add paginate method
BookSchema.plugin(mongoosePaginateHook({ beforePaginationFunction, afterPaginationFunction})); // hook functions

// Model
const BookModel = mongoose.model('Book', BookSchema);

// Use the pagination method
BookModel.paginate(
    {},
    {
        page: {
            number: 1,
            size: 15,
        }
    });

```

