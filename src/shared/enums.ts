
export enum WhereConditionType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'date',
  Unknown = 'unknown',
}

export enum RelationType {
  BelongsToOne = 'belongs-to-one',
  BelongsToMany = 'belongs-to-many',
  HasOne = 'has-one',
  HasMany = 'has-many',
}

export enum SchemaType {
  Number = 0,
  String = 1,
  Boolean = 2,
  Date = 3,
  Computed = 4,
  Relation = 5,
}
