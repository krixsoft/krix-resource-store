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
  Object = 4,
  Computed = 5,
  Relation = 6,
}
