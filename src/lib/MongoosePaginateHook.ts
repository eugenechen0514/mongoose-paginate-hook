import 'mongoose-paginate'
import {PaginateModel, Document, PaginateResult, Schema, PaginateOptions, Model} from 'mongoose';

export type AfterPaginationHookResult = any;
export type PaginateCallback<T extends Document> = (err: Error | undefined | null, result?: PaginateResult<T> | AfterPaginationHookResult) => void
export type SchemaStaticFunction<T extends Document> = PaginateModel<T>['paginate'];
export type BeforePaginationFunctionHook<T extends Document> = (paginateFunction: SchemaStaticFunction<T>, query: object, paginateOptions: PaginateOptions, callback?: PaginateCallback<T>) => Promise<PaginateResult<T>>;
export type AfterPaginationFunctionHook<T extends Document> = (result: PaginateResult<T>, paginateOptions?: PaginateOptions) => AfterPaginationHookResult;

export interface PaginateHookOptions<T extends Document> {
    beforePaginationFunction?: BeforePaginationFunctionHook<T>;
    afterPaginationFunction?: AfterPaginationFunctionHook<T>;
    paginateFunctionName?: string;
}

/**
 *
 * new pagination method signature
 */
export function mongoosePaginateHook<DocType extends Document, SchemaDefinitionType = undefined>({
                                         beforePaginationFunction,
                                         afterPaginationFunction,
                                         paginateFunctionName = 'paginate'}: PaginateHookOptions<DocType>) {
    return function hookPlugin (schema : Schema<DocType, Model<DocType>, SchemaDefinitionType>, options?: any) {
        const paginateFunction = schema.statics[paginateFunctionName];
        if(paginateFunction && typeof paginateFunction === 'function') {
            if(afterPaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] = function(query: object, paginateOptions: PaginateOptions, callback?: PaginateCallback<DocType>) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    if(typeof callback === 'function') {
                        _paginateFunction(query, paginateOptions, (err: Error | undefined | null, result?: PaginateResult<DocType>) => {
                            if(err) {
                                callback(err);
                            } else {
                                // no error
                                if(!result) {
                                    callback(new Error('no error but result is empty, mongoose-paginate may have bugs'));
                                } else {
                                    callback(err, afterPaginationFunction(result, paginateOptions));
                                }
                            }
                        })
                    } else {
                        return _paginateFunction(query, paginateOptions)
                            .then(afterPaginationFunction)
                    }
                }
            }

            if(beforePaginationFunction) {
                const orgPaginateFunction = schema.statics[paginateFunctionName];
                schema.statics[paginateFunctionName] =  function(query: object, paginateOptions: PaginateOptions, callback?: PaginateCallback<DocType>) {
                    const _paginateFunction = orgPaginateFunction.bind(this);
                    return beforePaginationFunction(_paginateFunction, query, paginateOptions, callback);
                }
            }
        } else {
            throw new Error('Can not find pagination function');
        }
    };
}
