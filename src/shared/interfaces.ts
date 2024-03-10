import * as Enums from './enums';

export type ComputedFunction<ResourceType = any, ComputedType = any> = (resource: ResourceType) => ComputedType;

export interface ComputedField<ResourceType = any, ComputedType = any> {
  name: string;
  enumerable?: boolean;
  fn: ComputedFunction<ResourceType, ComputedType>;
}

export interface BelongsToIncludeField {
  includeType: Enums.RelationType.BelongsToOne | Enums.RelationType.BelongsToMany;
  /**
   * Local property which will be created as `getter`.
   */
  propertyName: string;
  /**
   * Target resource store.
   */
  targetResourceName: string;
  /**
   * Logic extracts a value from the property of the source resource (by `sourcePropertyName`)
   * and uses this value to find related resources in the target resource store.
   */
  sourcePropertyName: string;
  enumerable?: boolean;
}

export interface HasIncludeField {
  includeType: Enums.RelationType.HasOne | Enums.RelationType.HasMany;
  /**
   * Local property which will be created as `getter`.
   */
  propertyName: string;
  /**
   * Target resource store.
   */
  targetResourceName: string;
  /**
   * Logic extracts the ID from the the source resource and uses this ID to find related resources
   * in the target resource store by `targetPropertyName`.
   */
  targetPropertyName: string;
  enumerable?: boolean;
}

export type IncludeField = BelongsToIncludeField | HasIncludeField;

export interface BaseResource {
  id?: string | number;
  [key: string]: any;
}

export interface FindOptions {}

/**
 * Where condition config for properties with a `number` type.
 */
export interface NumberWhereConditions {
  /**
   * Resource's field stores any value from the passed array of numbers.
   */
  in: number[];
  /**
   * Resource's field doesn't store values from the passed array of numbers.
   */
  '!in': number[];

  /**
   * Resource's field is equal to the passed number.
   */
  '===': number;
  /**
   * Resource's field isn't equal to the passed number.
   */
  '!==': number;
  /**
   * Resource's field is equal to the passed number or more than it.
   */
  '>=': number;
  /**
   * Resource's field is more than the passed number.
   */
  '>': number;
  /**
   * Resource's field is equal to the passed number or less than it.
   */
  '<=': number;
  /**
   * Resource's field is less than the passed number.
   */
  '<': number;

  /**
   * Resource's field is in the range from start up to end, but not including both ranges.
   */
  '()': [number, number];
  /**
   * Resource's field is in the range from start up to, but not including, end.
   */
  '[)': [number, number];
  /**
   * Resource's field is in the range from start but not including it, and up to end including it.
   */
  '(]': [number, number];
  /**
   * Resource's field is in the range from start up to end, including both ranges.
   */
  '[]': [number, number];
  /**
   * Resource's field isn't in the range from start up to end, but not including both ranges.
   */
  '!()': [number, number];
  /**
   * Resource's field isn't in the range from start up to, but not including, end.
   */
  '![)': [number, number];
  /**
   * Resource's field isn't in the range from start but not including it, and up to end including it.
   */
  '!(]': [number, number];
  /**
   * Resource's field isn't in the range from start up to end, including both ranges.
   */
  '![]': [number, number];
}

/**
 * Where condition config for properties with a `boolean` type.
 */
export interface BooleanWhereConditions {
  /**
   * Resource's field is equal to the passed value.
   */
  '===': boolean;
  /**
   * Resource's field isn't equal to the passed value.
   */
  '!==': boolean;
}

/**
 * Where condition config for properties with a `string` type.
 */
export interface StringWhereConditions {
  /**
   * Resource's field stores any value from the passed array of strings.
   */
  in: string[];
  /**
   * Resource's field doesn't store values from the passed array of strings.
   */
  '!in': string[];

  /**
   * Resource's field is equal to the passed string.
   */
  '===': string;
  /**
   * Resource's field isn't equal to the passed string.
   */
  '!==': string;

  /**
   * Resource's field looks like to the passed string|RegExp.
   */
  like: string | RegExp;
  /**
   * Resource's field doesn't look like to the passed string|RegExp.
   */
  '!like': string | RegExp;
}

/**
 * Where condition config for properties with a `date` type.
 */
export interface DateWhereConditions {
  /**
   * Resource's field stores any value from the passed array of dates.
   */
  in: Date[];
  /**
   * Resource's field doesn't store values from the passed array of dates.
   */
  '!in': Date[];

  /**
   * Resource's field is equal to the passed date.
   */
  '===': Date;
  /**
   * Resource's field isn't equal to the passed date.
   */
  '!==': Date;
  /**
   * Resource's field is equal to the passed date or more than it.
   */
  '>=': Date;
  /**
   * Resource's field is more than the passed date.
   */
  '>': Date;
  /**
   * Resource's field is equal to the passed date or less than it.
   */
  '<=': Date;
  /**
   * Resource's field is less than the passed date.
   */
  '<': Date;

  /**
   * Resource's field is in the range from start up to end, but not including both ranges.
   */
  '()': [Date, Date];
  /**
   * Resource's field is in the range from start up to, but not including, end.
   */
  '[)': [Date, Date];
  /**
   * Resource's field is in the range from start but not including it, and up to end including it.
   */
  '(]': [Date, Date];
  /**
   * Resource's field is in the range from start up to end, including both ranges.
   */
  '[]': [Date, Date];
  /**
   * Resource's field isn't in the range from start up to end, but not including both ranges.
   */
  '!()': [Date, Date];
  /**
   * Resource's field isn't in the range from start up to, but not including, end.
   */
  '![)': [Date, Date];
  /**
   * Resource's field isn't in the range from start but not including it, and up to end including it.
   */
  '!(]': [Date, Date];
  /**
   * Resource's field isn't in the range from start up to end, including both ranges.
   */
  '![]': [Date, Date];
}

/**
 * Common `where` condition config for all property types.
 */
export type WhereCondition<ValueType> = ValueType extends string
  ? Partial<StringWhereConditions> | ValueType
  : ValueType extends Date
    ? Partial<DateWhereConditions> | ValueType
    : ValueType extends number
      ? Partial<NumberWhereConditions> | ValueType
      : ValueType extends boolean
        ? Partial<BooleanWhereConditions> | ValueType
        : ValueType extends null
          ? null
          : undefined;

/**
 * Object with `where` conditions for resource properties. If object is empty or equal to null or undefined,
 * condition is always true.
 */
export type WhereConditions<T> = {
  [P in keyof T]?: WhereCondition<T[P]>;
};

/**
 * Schema field which contains only a native type.
 */
export type SimpleSchemaField =
  | Enums.SchemaType.Number
  | Enums.SchemaType.String
  | Enums.SchemaType.Boolean
  | Enums.SchemaType.Date
  | Enums.SchemaType.Object;

/**
 * Base interface for all complex fields - field which is described by an object.
 */
export interface BaseComplexSchemaField {
  type: Enums.SchemaType;
}
/**
 * Describes complex settings for a native field value.
 */
export interface NativeComplexSchemaField extends BaseComplexSchemaField {
  type: SimpleSchemaField;
  required?: boolean;
}
/**
 * Every computed field will be set as `getter` in every resource `object`. If computed field is called,
 * getter will call the `compute` method from settings.
 */
export interface ComputedSchemaField<ResourceType> extends BaseComplexSchemaField {
  type: Enums.SchemaType.Computed;
  compute: (resource: ResourceType) => any;
}
/**
 * Examples:
 * // We add `payment` property to `User` resources and use `id` property of source
 * // resource to find related resource in `payment` resource store by `userId`.
 * const a3: IncludeField = {
 *   includeType: Enums.IncludeType.HasOne,
 *   propertyName: 'payment',
 *    resourceName: 'payment',
 *    targetPropertyName: 'userId',
 * };
 *
 * // We add `articles` property to `User` resources and use `id` property of source
 * // resource to find related resource in `article` resource store by `authorId`.
 * const a4: IncludeField = {
 *   includeType: Enums.IncludeType.HasMany,
 *   propertyName: 'articles',
 *   resourceName: 'article',
 *   targetPropertyName: 'authorId',
 * };
 *
 * FYI[WARN]: This logic is very expensive because uses `Nested Loops Join` algorithm.
 * http://dcx.sap.com/1101/en/dbusage_en11/join-methods-optimizer-queryopt.html
 */
export interface RelationHasSchemaField extends BaseComplexSchemaField {
  type: Enums.SchemaType.Relation;
  relation: Enums.RelationType.HasMany | Enums.RelationType.HasOne;
  resource: string;
  targetProperty: string;
}
/**
 * Examples:
 * // We add `author` property to `Article` resources and use `authorId` property of the
 * // source resource to find related resource in `user` resource store by `id`.
 * {
 *   includeType: Enums.IncludeType.BelongsToOne,
 *   propertyName: 'author',
 *   resourceName: 'user',
 *   sourcePropertyName: 'authorId',
 * };
 *
 * // We add `tags` property to `Article` resources and use `tagIds` property of source
 * // resource to find related resources in `tag` resource store by `id`.
 * const a2: IncludeField = {
 *   includeType: Enums.IncludeType.BelongsToMany,
 *   propertyName: 'tags',
 *   resourceName: 'tag',
 *   sourcePropertyName: 'tagIds',
 * };
 *
 * FYI[WARN]: This logic is very expensive because uses `Nested Loops Join` algorithm.
 * http://dcx.sap.com/1101/en/dbusage_en11/join-methods-optimizer-queryopt.html
 */
export interface RelationBelongsToSchemaField<ResourceType> extends BaseComplexSchemaField {
  type: Enums.SchemaType.Relation;
  relation: Enums.RelationType.BelongsToMany | Enums.RelationType.BelongsToOne;
  resource: string;
  sourceProperty: keyof ResourceType;
}

export type SchemaField<ResourceType> =
  | SimpleSchemaField
  | NativeComplexSchemaField
  | ComputedSchemaField<ResourceType>
  | RelationHasSchemaField
  | RelationBelongsToSchemaField<ResourceType>;

export type Schema<ResourceType> = {
  /**
   * The description of a resource column for model
   */
  [P in keyof ResourceType]: SchemaField<ResourceType>;
};
