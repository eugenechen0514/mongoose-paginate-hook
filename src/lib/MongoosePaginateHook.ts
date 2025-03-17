import "mongoose-paginate-v2";
import {
  Document,
  PaginateResult,
  Schema,
  PaginateOptions,
  Model,
} from "mongoose";

export type PaginateFunctionLike<
  T = any,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions,
  PaginationHookResult = PaginateResult<T>
> = (
  query?: Object,
  options?: CUSTOM_PAGINATE_OPTIONS,
  callback?: (err: any, result: PaginationHookResult) => void
) => Promise<PaginationHookResult>;
export type AfterPaginationHookResult = any;
export type PaginateCallback<T extends Document> = (
  err: Error | undefined | null,
  result?: PaginateResult<T> | AfterPaginationHookResult
) => void;
export type SchemaStaticFunction<
  T extends Document,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions
> = PaginateFunctionLike<T, CUSTOM_PAGINATE_OPTIONS>;
export type BeforePaginationFunctionHook<
  T extends Document,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions
> = (
  paginateFunction: SchemaStaticFunction<T>,
  query: object,
  paginateOptions: CUSTOM_PAGINATE_OPTIONS,
  callback?: PaginateCallback<T>
) => Promise<PaginateResult<T>>;
export type AfterPaginationFunctionHook<
  T extends Document,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions
> = (
  result: PaginateResult<T>,
  paginateOptions: CUSTOM_PAGINATE_OPTIONS
) => AfterPaginationHookResult;

export interface PaginateHookOptions<
  T extends Document,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions
> {
  beforePaginationFunction?: BeforePaginationFunctionHook<
    T,
    CUSTOM_PAGINATE_OPTIONS
  >;
  afterPaginationFunction?: AfterPaginationFunctionHook<
    T,
    CUSTOM_PAGINATE_OPTIONS
  >;
  paginateFunctionName?: string;
}

/**
 *
 * new pagination method signature
 */
export function mongoosePaginateHook<
  DocType extends Document,
  SchemaDefinitionType = undefined,
  CUSTOM_PAGINATE_OPTIONS = PaginateOptions
>({
  beforePaginationFunction,
  afterPaginationFunction,
  paginateFunctionName = "paginate",
}: PaginateHookOptions<DocType, CUSTOM_PAGINATE_OPTIONS>) {
  return function hookPlugin(
    schema: Schema<DocType, Model<DocType>, SchemaDefinitionType>,
    options?: any
  ) {
    const paginateFunction = schema.statics[paginateFunctionName];
    if (paginateFunction && typeof paginateFunction === "function") {
      if (afterPaginationFunction) {
        const orgPaginateFunction = schema.statics[
          paginateFunctionName
        ] as PaginateFunctionLike<DocType, CUSTOM_PAGINATE_OPTIONS>;
        schema.statics[paginateFunctionName] = function (
          query: object,
          paginateOptions: CUSTOM_PAGINATE_OPTIONS,
          callback?: PaginateCallback<DocType>
        ) {
          const _paginateFunction = orgPaginateFunction.bind(this);
          if (typeof callback === "function") {
            _paginateFunction(
              query,
              paginateOptions,
              (
                err: Error | undefined | null,
                result?: PaginateResult<DocType>
              ) => {
                if (err) {
                  callback(err);
                } else {
                  // no error
                  if (!result) {
                    callback(
                      new Error(
                        "no error but result is empty, mongoose-paginate may have bugs"
                      )
                    );
                  } else {
                    callback(
                      err,
                      afterPaginationFunction(result, paginateOptions)
                    );
                  }
                }
              }
            );
          } else {
            return _paginateFunction(query, paginateOptions).then((result) => {
              return afterPaginationFunction(result, paginateOptions);
            });
          }
        };
      }

      if (beforePaginationFunction) {
        const orgPaginateFunction = schema.statics[paginateFunctionName];
        schema.statics[paginateFunctionName] = function (
          query: object,
          paginateOptions: CUSTOM_PAGINATE_OPTIONS,
          callback?: PaginateCallback<DocType>
        ) {
          const _paginateFunction = orgPaginateFunction.bind(
            this
          ) as PaginateFunctionLike;
          return beforePaginationFunction(
            _paginateFunction,
            query,
            paginateOptions,
            callback
          );
        };
      }
    } else {
      throw new Error("Can not find pagination function");
    }
  };
}
