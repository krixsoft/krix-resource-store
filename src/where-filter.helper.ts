import type { Interfaces } from './shared';
import { Enums, Helper } from './shared';

export class WhereFilterHelper {

  static create (
  ): WhereFilterHelper {
    const inst = new WhereFilterHelper();
    return inst;
  }

  /**
   * Returns `true` if resource correspons to `where` condition.
   *
   * @param  {ResourceType} resource
   * @param  {Interfaces.WhereOptions<ResourceType>} where
   * @return {boolean}
   */
  filterByCondition <ResourceType extends Interfaces.BaseResource> (
    resource: ResourceType,
    where: Interfaces.WhereConditions<ResourceType>,
  ): boolean {
    if (Helper.isNil(where) === true) {
      return true;
    }

    const propKeys = Helper.keys(where);
    if (Helper.isEmpty(propKeys) === true) {
      return true;
    }

    const resourceIsEqual = Helper.every(propKeys, (propKey: keyof ResourceType) => {
      const condition = where[propKey];
      const resourceValue = resource[propKey];

      const conditionType = this.defineWhereConditionType(condition);
      switch (conditionType) {
        case Enums.WhereConditionType.Boolean:
          return this.filterByBoolean(resourceValue, condition);
        case Enums.WhereConditionType.Date:
          return this.filterByDate(resourceValue, condition);
        case Enums.WhereConditionType.Number:
          return this.filterByNumber(resourceValue, condition);
        case Enums.WhereConditionType.String:
          return this.filterByString(resourceValue, condition);
        case Enums.WhereConditionType.Unknown:
          throw new Error(`WhereFilterHelper.filterByCondition: `
            + `Something went wrong. We can recognize 'where' condition.`);
      }
    });

    return resourceIsEqual;
  }

  /**
   * Defines type of `where` condition by a `where` operator and returns it. If types isn't defined,
   * method will return `Unknown` type.
   *
   * @param  {Interfaces.WhereCondition<any>} condition
   * @return {Enums.WhereConditionType}
   */
  private defineWhereConditionType (
    condition: Interfaces.WhereCondition<any>,
  ): Enums.WhereConditionType {
    const primitiveType = this.defineWhereConditionTypeByValue(condition);

    if (primitiveType !== Enums.WhereConditionType.Unknown) {
      return primitiveType;
    }

    if (Helper.isEmpty(condition['in']) === false) {
      return this.defineWhereConditionTypeByValue(condition['in'][0]);
    }

    if (Helper.isEmpty(condition['!in']) === false) {
      return this.defineWhereConditionTypeByValue(condition['!in'][0]);
    }

    if (Helper.has(condition, '===') === true) {
      return this.defineWhereConditionTypeByValue(condition['===']);
    }

    if (Helper.has(condition, '!==') === true) {
      return this.defineWhereConditionTypeByValue(condition['!==']);
    }

    if (Helper.has(condition, 'like') === true || Helper.has(condition, '!like') === true) {
      return Enums.WhereConditionType.String;
    }

    if (Helper.has(condition, '>=') === true) {
      return this.defineWhereConditionTypeByValue(condition['>=']);
    }

    if (Helper.has(condition, '>') === true) {
      return this.defineWhereConditionTypeByValue(condition['>']);
    }

    if (Helper.has(condition, '<=') === true) {
      return this.defineWhereConditionTypeByValue(condition['<=']);
    }

    if (Helper.has(condition, '<') === true) {
      return this.defineWhereConditionTypeByValue(condition['<']);
    }

    if (Helper.has(condition, '[]') === true) {
      const range = condition['[]'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }
    if (Helper.has(condition, '![]') === true) {
      const range = condition['![]'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }

    if (Helper.has(condition, '[)') === true) {
      const range = condition['[)'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }
    if (Helper.has(condition, '![)') === true) {
      const range = condition['![)'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }

    if (Helper.has(condition, '(]') === true) {
      const range = condition['(]'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }
    if (Helper.has(condition, '!(]') === true) {
      const range = condition['!(]'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }

    if (Helper.has(condition, '()') === true) {
      const range = condition['()'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }
    if (Helper.has(condition, '!()') === true) {
      const range = condition['!()'];
      return this.defineWhereConditionTypeByValue(range[0]);
    }

    return Enums.WhereConditionType.Unknown;
  }

  /**
   * Defines type of `where` condition by the value and returns it. If types isn't defined,
   * method will return `Unknown` type.
   *
   * @param  {unknown} value
   * @return {Enums.WhereConditionType}
   */
  private defineWhereConditionTypeByValue (
    value: unknown,
  ): Enums.WhereConditionType {
    if (typeof value === 'string') {
      return Enums.WhereConditionType.String;
    }

    if (typeof value === 'number') {
      return Enums.WhereConditionType.Number;
    }

    if (typeof value === 'boolean') {
      return Enums.WhereConditionType.Boolean;
    }

    if (value instanceof Date) {
      return Enums.WhereConditionType.Date;
    }

    return Enums.WhereConditionType.Unknown;
  }

  /**
   * Returns `true` if condition is for `date` property and value corresponds some condition.
   *
   * @param  {Date|null|undefined} value
   * @param  {Date|null|undefined|Interfaces.DateWhereConditions} condition
   * @return {boolean}
   */
  private filterByDate (
    value: Date | null | undefined,
    condition: Date | null | undefined | Interfaces.DateWhereConditions,
  ): boolean {
    const numvalue: number | null = value instanceof Date
      ? value.getTime() : null;

    if (condition === null || condition === undefined) {
      return numvalue === (condition as null);
    }

    if (condition instanceof Date) {
      return numvalue === condition.getTime();
    }

    if (Helper.isEmpty(condition['in']) === false) {
      const findedValue = Helper.find(condition['in'], (conditionValue) => {
        return numvalue === conditionValue.getTime();
      });
      return Helper.isNil(findedValue) === false;
    }

    if (Helper.isEmpty(condition['!in']) === false) {
      const findedValue = Helper.find(condition['!in'], (conditionValue) => {
        return numvalue === conditionValue.getTime();
      });
      return Helper.isNil(findedValue) === true;
    }

    if (Helper.has(condition, '===') === true) {
      return numvalue === condition['==='].getTime();
    }

    if (Helper.has(condition, '!==') === true) {
      return numvalue === condition['!=='].getTime();
    }

    return this.filterByRange(value, condition);
  }

  /**
   * Returns `true` if condition is for `boolean` property and value corresponds some condition.
   *
   * @param  {boolean|null|undefined} value
   * @param  {boolean|null|undefined|Interfaces.BooleanWhereConditions} condition
   * @return {boolean}
   */
  private filterByBoolean (
    value: boolean | null | undefined,
    condition: boolean | null | undefined | Interfaces.BooleanWhereConditions,
  ): boolean {
    if (condition === null || condition === undefined) {
      return value === (condition as null);
    }

    if (typeof condition === 'boolean') {
      return value === condition;
    }

    if (Helper.has(condition, '===') === true) {
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      return value !== condition['!=='];
    }
  }

  /**
   * Returns `true` if condition is for `string` property and value corresponds some condition.
   *
   * @param  {string|null|undefined} value
   * @param  {string|null|undefined|Interfaces.StringWhereConditions} condition
   * @return {boolean}
   */
  private filterByString (
    value: string | null | undefined,
    condition: string | null | undefined | Interfaces.StringWhereConditions,
  ): boolean {
    if (condition === null || condition === undefined) {
      return value === (condition as null);
    }

    if (typeof condition === 'string') {
      return value === condition;
    }

    if (Helper.isEmpty(condition['in']) === false) {
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.isEmpty(condition['!in']) === false) {
      return Helper.includes(condition['!in'], value) === false;
    }

    if (Helper.has(condition, '===') === true) {
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      return value !== condition['!=='];
    }

    if (Helper.has(condition, 'like') === true) {
      const rgx = typeof condition['like'] === 'string'
        ? new RegExp(condition['like'])
        : condition['like'];
      return rgx.test(value) === true;
    }

    if (Helper.has(condition, '!like') === true) {
      const rgx = typeof condition['!like'] === 'string'
        ? new RegExp(condition['!like'])
        : condition['!like'];
      return rgx.test(value) === false;
    }
  }

  /**
   * Returns `true` if condition is for `number` property and value corresponds some condition.
   *
   * @param  {number|null|undefined} value
   * @param  {number|null|undefined|Interfaces.NumberWhereConditions} condition
   * @return {boolean}
   */
  private filterByNumber (
    value: number | null | undefined,
    condition: number | null | undefined | Interfaces.NumberWhereConditions,
  ): boolean {
    if (condition === null || condition === undefined) {
      return value === (condition as null);
    }

    if (typeof condition === 'number') {
      return value === condition;
    }

    if (Helper.isEmpty(condition['in']) === false) {
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.isEmpty(condition['!in']) === false) {
      return Helper.includes(condition['!in'], value) === false;
    }

    if (Helper.has(condition, '===') === true) {
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      return value !== condition['!=='];
    }

    return this.filterByRange(value, condition);
  }

  /**
   * Returns `true` if condition has range `where` property and value is in this range.
   *
   * @param  {number|Date} value
   * @param  {Interfaces.NumberWhereConditions|Interfaces.DateWhereConditions} condition
   * @return {boolean}
   */
  private filterByRange (
    value: number | Date,
    condition: Interfaces.NumberWhereConditions | Interfaces.DateWhereConditions,
  ): boolean {
    if (Helper.has(condition, '>=') === true) {
      return value >= condition['>='];
    }

    if (Helper.has(condition, '>') === true) {
      return value > condition['>'];
    }

    if (Helper.has(condition, '<=') === true) {
      return value <= condition['<='];
    }

    if (Helper.has(condition, '<') === true) {
      return value < condition['<'];
    }

    const rangeILIR = Helper.has(condition, '[]') === true;
    if (rangeILIR === true || Helper.has(condition, '![]') === true) {
      const range = condition['[]'] ?? condition['![]'];
      const result = value >= range[0] && value <= range[1];
      return rangeILIR === true ? result : !result;
    }

    const rangeILNR = Helper.has(condition, '[)') === true;
    if (rangeILNR === true || Helper.has(condition, '![)') === true) {
      const range = condition['[)'] ?? condition['![)'];
      const result = value >= range[0] && value < range[1];
      return rangeILNR === true ? result : !result;
    }

    const rangeNLIR = Helper.has(condition, '(]') === true;
    if (rangeNLIR === true || Helper.has(condition, '!(]') === true) {
      const range = condition['(]'] ?? condition['!(]'];
      const result = value > range[0] && value <= range[1];
      return rangeNLIR === true ? result : !result;
    }

    const rangeNLNR = Helper.has(condition, '()') === true;
    if (rangeNLNR === true || Helper.has(condition, '!()') === true) {
      const range = condition['()'] ?? condition['!()'];
      const result = value > range[0] && value < range[1];
      return rangeNLNR === true ? result : !result;
    }

    return false;
  }
}
