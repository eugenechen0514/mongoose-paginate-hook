import 'mongoose-paginate-v2';
import { Document, PaginateResult, Schema, PaginateOptions, Model } from 'mongoose';
export type PaginateFunctionLike<T = any, CUSTOM_PAGINATE_OPTIONS = PaginateOptions, PaginationHookResult = PaginateResult<T>> = (query?: Object, options?: CUSTOM_PAGINATE_OPTIONS, callback?: (err: any, result: PaginationHookResult) => void) => Promise<PaginationHookResult>;
export type AfterPaginationHookResult = any;
export type PaginateCallback<T extends Document> = (err: Error | undefined | null, result?: PaginateResult<T> | AfterPaginationHookResult) => void;
export type SchemaStaticFunction<T extends Document, CUSTOM_PAGINATE_OPTIONS = PaginateOptions> = PaginateFunctionLike<T, CUSTOM_PAGINATE_OPTIONS>;
export type BeforePaginationFunctionHook<T extends Document, CUSTOM_PAGINATE_OPTIONS = PaginateOptions> = (paginateFunction: SchemaStaticFunction<T>, query: object, paginateOptions: CUSTOM_PAGINATE_OPTIONS, callback?: PaginateCallback<T>) => Promise<PaginateResult<T>>;
export type AfterPaginationFunctionHook<T extends Document, CUSTOM_PAGINATE_OPTIONS = PaginateOptions> = (result: PaginateResult<T>, paginateOptions: CUSTOM_PAGINATE_OPTIONS) => AfterPaginationHookResult;
export interface PaginateHookOptions<T extends Document, CUSTOM_PAGINATE_OPTIONS = PaginateOptions> {
    beforePaginationFunction?: BeforePaginationFunctionHook<T, CUSTOM_PAGINATE_OPTIONS>;
    afterPaginationFunction?: AfterPaginationFunctionHook<T, CUSTOM_PAGINATE_OPTIONS>;
    paginateFunctionName?: string;
}
/**
 *
 * new pagination method signature
 */
export declare function mongoosePaginateHook<DocType extends Document, SchemaDefinitionType = undefined, CUSTOM_PAGINATE_OPTIONS = PaginateOptions>({ beforePaginationFunction, afterPaginationFunction, paginateFunctionName }: PaginateHookOptions<DocType, CUSTOM_PAGINATE_OPTIONS>): (schema: Schema<DocType, Model<DocType>, SchemaDefinitionType>, options?: any) => void;
