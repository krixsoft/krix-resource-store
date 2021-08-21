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
      throw new Error(`WhereFilterHelper.filterByCondition: `
        + `"Where" condition is required.`);
    }

    const propKeys = Helper.keys(where);
    if (Helper.isEmpty(propKeys) === true) {
      throw new Error(`WhereFilterHelper.filterByCondition: `
        + `"Where" condition must have at least 1 field.`);
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
    const valueAsNumber: number | null | undefined = value instanceof Date
      ? value.getTime() : value;

    if (Helper.isNil(condition) === true) {
      return valueAsNumber === (condition as (null | undefined));
    }

    if (condition instanceof Date) {
      return valueAsNumber === condition.getTime();
    }

    if (Helper.has(condition, 'in') === true) {
      if (Helper.isArray(condition['in']) === false || Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      const valueIndex = Helper.findIndex(condition['in'], (conditionValue) => {
        if (Helper.isNil(conditionValue) === true) {
          return valueAsNumber === (conditionValue as (null | undefined));
        }
        return valueAsNumber === conditionValue.getTime();
      });
      return valueIndex !== -1;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isArray(condition['!in']) === false || Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
      const valueIndex = Helper.findIndex(condition['!in'], (conditionValue) => {
        if (Helper.isNil(conditionValue) === true) {
          return valueAsNumber === (conditionValue as (null | undefined));
        }
        return valueAsNumber === conditionValue.getTime();
      });
      return valueIndex === -1;
    }

    if (Helper.has(condition, '===') === true) {
      if (Helper.isNil(condition['===']) === true) {
        return valueAsNumber === (condition['==='] as (null | undefined));
      }
      return valueAsNumber === condition['==='].getTime();
    }

    if (Helper.has(condition, '!==') === true) {
      if (Helper.isNil(condition['!==']) === true) {
        return valueAsNumber !== (condition['!=='] as (null | undefined));
      }
      return valueAsNumber !== condition['!=='].getTime();
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
    if (Helper.isNil(condition) === true) {
      return value === (condition as (null | undefined));
    }

    if (typeof condition === 'boolean') {
      return value === condition;
    }

    if (Helper.has(condition, '===') === true) {
      if (Helper.isNil(condition['===']) === true) {
        return value === (condition['==='] as (null | undefined));
      }
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      if (Helper.isNil(condition['!==']) === true) {
        return value !== (condition['!=='] as (null | undefined));
      }
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
    if (Helper.isNil(condition) === true) {
      return value === (condition as null);
    }

    if (typeof condition === 'string') {
      return value === condition;
    }

    if (Helper.has(condition, 'in') === true) {
      if (Helper.isArray(condition['in']) === false || Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isArray(condition['!in']) === false || Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
      return Helper.includes(condition['!in'], value) === false;
    }

    if (Helper.has(condition, '===') === true) {
      if (Helper.isNil(condition['===']) === true) {
        return value === (condition['==='] as (null | undefined));
      }
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      if (Helper.isNil(condition['!==']) === true) {
        return value === (condition['!=='] as (null | undefined));
      }
      return value !== condition['!=='];
    }

    if (Helper.has(condition, 'like') === true) {
      if (Helper.isNil(condition['like']) === true) {
        return false;
      }

      if (typeof condition['like'] !== 'string' && (condition['like'] instanceof RegExp) === false) {
        return false;
      }

      const rgx = typeof condition['like'] === 'string'
        ? new RegExp(condition['like'])
        : condition['like'];
      return rgx.test(value) === true;
    }

    if (Helper.has(condition, '!like') === true) {
      if (Helper.isNil(condition['!like']) === true) {
        return false;
      }

      if (typeof condition['!like'] !== 'string' && (condition['!like'] instanceof RegExp) === false) {
        return false;
      }

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
      if (Helper.isArray(condition['in']) === false || Helper.isEmpty(condition['in']) === true) {
        return false;
      }
      return Helper.includes(condition['in'], value) === true;
    }

    if (Helper.has(condition, '!in') === true) {
      if (Helper.isArray(condition['!in']) === false || Helper.isEmpty(condition['!in']) === true) {
        return false;
      }
      return Helper.includes(condition['!in'], value) === false;
    }

    if (Helper.has(condition, '===') === true) {
      if (Helper.isNil(condition['===']) === true) {
        return value === (condition['==='] as (null | undefined));
      }
      return value === condition['==='];
    }

    if (Helper.has(condition, '!==') === true) {
      if (Helper.isNil(condition['!==']) === true) {
        return value !== (condition['!=='] as (null | undefined));
      }
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
      if (Helper.isNil(condition['>=']) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: ">=" condition can't contain "nil" value.`);
      }
      return value >= condition['>='];
    }

    if (Helper.has(condition, '>') === true) {
      if (Helper.isNil(condition['>']) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: ">" condition can't contain "nil" value.`);
      }
      return value > condition['>'];
    }

    if (Helper.has(condition, '<=') === true) {
      if (Helper.isNil(condition['<=']) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "<=" condition can't contain "nil" value.`);
      }
      return value <= condition['<='];
    }

    if (Helper.has(condition, '<') === true) {
      if (Helper.isNil(condition['<']) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "<" condition can't contain "nil" value.`);
      }
      return value < condition['<'];
    }

    if (Helper.has(condition, '[]') === true) {
      const conditionValue = condition['[]'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "[]" condition can't contain "nil" value.`);
      }

      return value >= conditionValue[0] && value <= conditionValue[1];
    }

    if (Helper.has(condition, '![]') === true) {
      const conditionValue = condition['![]'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "![]" condition can't contain "nil" value.`);
      }

      return !(value >= conditionValue[0] && value <= conditionValue[1]);
    }

    if (Helper.has(condition, '[)') === true) {
      const conditionValue = condition['[)'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "[)" condition can't contain "nil" value.`);
      }

      return value >= conditionValue[0] && value < conditionValue[1];
    }

    if (Helper.has(condition, '![)') === true) {
      const conditionValue = condition['![)'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "![)" condition can't contain "nil" value.`);
      }

      return !(value >= conditionValue[0] && value < conditionValue[1]);
    }

    if (Helper.has(condition, '(]') === true) {
      const conditionValue = condition['(]'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "(]" condition can't contain "nil" value.`);
      }

      return value > conditionValue[0] && value <= conditionValue[1];
    }

    if (Helper.has(condition, '!(]') === true) {
      const conditionValue = condition['!(]'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "!(]" condition can't contain "nil" value.`);
      }

      return !(value > conditionValue[0] && value <= conditionValue[1]);
    }

    if (Helper.has(condition, '()') === true) {
      const conditionValue = condition['()'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "()" condition can't contain "nil" value.`);
      }

      return value > conditionValue[0] && value < conditionValue[1];
    }

    if (Helper.has(condition, '!()') === true) {
      const conditionValue = condition['!()'];
      if (Helper.isArray(conditionValue) === false || Helper.isEmpty(conditionValue) === true) {
        return false;
      }

      if (Helper.isNil(conditionValue[0]) === true || Helper.isNil(conditionValue[1]) === true) {
        throw new Error(`WhereFilterHelper.filterByRange: "!()" condition can't contain "nil" value.`);
      }

      return !(value > conditionValue[0] && value < conditionValue[1]);
    }

    return false;
  }
}
