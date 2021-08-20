import type { Interfaces } from './shared';
import { Enums, Helper } from './shared';

export class WhereFilterHelper {

  /**
   * Returns `true` if resource correspons to `where` condition.
   *
   * @param  {Interfaces.Schema<ResourceType>} schema
   * @param  {ResourceType} resource
   * @param  {Interfaces.WhereOptions<ResourceType>} where
   * @return {boolean}
   */
  filterByCondition <ResourceType extends Interfaces.BaseResource> (
    schema: Interfaces.Schema<ResourceType>,
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
      const propertyType = typeof schema[propKey] === 'object'
        ? (schema[propKey] as Interfaces.BaseComplexSchemaField).type
        : schema[propKey];
      const condition = where[propKey];
      const resourceValue = resource[propKey];

      switch (propertyType) {
        case Enums.SchemaType.Boolean:
          return this.filterByBoolean(resourceValue, condition);
        case Enums.SchemaType.Date:
          return this.filterByDate(resourceValue, condition);
        case Enums.SchemaType.Number:
          return this.filterByNumber(resourceValue, condition);
        case Enums.SchemaType.String:
          return this.filterByString(resourceValue, condition);
        default:
          throw new Error(`WhereFilterHelper.filterByCondition: `
            + `"Where" condition can only filter "Number", "Boolean", "String" and "Date" fields.`);
      }
    });

    return resourceIsEqual;
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

    if (Helper.has(condition, 'in') === true) {
      if (Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      const findedValue = Helper.find(condition['in'], (conditionValue) => {
        return numvalue === conditionValue.getTime();
      });
      return Helper.isNil(findedValue) === false;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
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

    if (Helper.has(condition, 'in') === true) {
      if (Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
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
    if (Helper.isNil(condition) === true) {
      return value === (condition as null);
    }

    if (typeof condition === 'number') {
      return value === condition;
    }

    if (Helper.has(condition, 'in') === true) {
      if (Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
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
