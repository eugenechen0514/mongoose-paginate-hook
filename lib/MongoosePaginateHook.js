/**
 *
 * @param {function(paginateFunction: function, [query], [options], [callback])} beforePaginationFunction
 * @param {function(result):result} afterPaginationFunction
 * @param {string} paginateFunctionName
 * @return {function()}
 */
function mongoosePaginateHook({beforePaginationFunction, afterPaginationFunction, paginateFunctionName = 'paginate'}) {
    return function hookPlugin (schema, options) {
        const paginateFunction = schema.statics[paginateFunctionName];
        if(paginateFunction && typeof paginateFunction === 'function') {
            if(afterPaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] = function(query, options, callback) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    if(typeof callback === 'function') {
                        _paginateFunction(query, options, (err, result) => {
                            if(err) {
                                callback(err);
                            } else {
                                callback(err, afterPaginationFunction(result));
                            }
                        })
                    } else {
                        return _paginateFunction(query, options)
                            .then(afterPaginationFunction)
                    }
                }
            }

            if(beforePaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] =  function(query, options, callback) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    return beforePaginationFunction(_paginateFunction, query, options, callback);
                }
            }
        } else {
            throw new Error('Can not find pagination function');
        }
    };
}
module.exports = exports = mongoosePaginateHook;
