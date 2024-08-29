"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoosePaginateHook = mongoosePaginateHook;
require("mongoose-paginate");
/**
 *
 * new pagination method signature
 */
function mongoosePaginateHook({ beforePaginationFunction, afterPaginationFunction, paginateFunctionName = 'paginate' }) {
    return function hookPlugin(schema, options) {
        const paginateFunction = schema.statics[paginateFunctionName];
        if (paginateFunction && typeof paginateFunction === 'function') {
            if (afterPaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] = function (query, paginateOptions, callback) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    if (typeof callback === 'function') {
                        _paginateFunction(query, paginateOptions, (err, result) => {
                            if (err) {
                                callback(err);
                            }
                            else {
                                // no error
                                if (!result) {
                                    callback(new Error('no error but result is empty, mongoose-paginate may have bugs'));
                                }
                                else {
                                    callback(err, afterPaginationFunction(result, paginateOptions));
                                }
                            }
                        });
                    }
                    else {
                        return _paginateFunction(query, paginateOptions)
                            .then(afterPaginationFunction);
                    }
                };
            }
            if (beforePaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] = function (query, paginateOptions, callback) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    return beforePaginationFunction(_paginateFunction, query, paginateOptions, callback);
                };
            }
        }
        else {
            throw new Error('Can not find pagination function');
        }
    };
}
