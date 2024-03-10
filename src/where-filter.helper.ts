import type { Interfaces } from './shared';
import * as _ from './lodash';
import { Enums } from './shared';

export class WhereFilterHelper {
  /**
   * Returns `true` if resource corresponds to `where` condition.
   *
   * @param  {Interfaces.Schema<ResourceType>} schema
   * @param  {ResourceType} resource
   * @param  {Interfaces.WhereOptions<ResourceType>} where
   * @return {boolean}
   */
  filterByCondition<ResourceType extends Interfaces.BaseResource>(
    schema: Interfaces.Schema<ResourceType>,
    resource: ResourceType,
    where: Interfaces.WhereConditions<ResourceType>,
  ): boolean {
    if (_.isNil(where)) {
      throw new Error(`WhereFilterHelper.filterByCondition: ` + `"Where" condition is required.`);
    }

    const propKeys = Object.keys(where);
    if (_.isEmpty(propKeys)) {
      throw new Error(`WhereFilterHelper.filterByCondition: ` + `"Where" condition must have at least 1 field.`);
    }

    const resourceIsEqual = _.every(propKeys, (propKey: keyof ResourceType) => {
      const propertyType =
        typeof schema[propKey] === 'object'
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
          throw new Error(
            `WhereFilterHelper.filterByCondition: ` +
              `"Where" condition can only filter "Number", "Boolean", "String" and "Date" fields.`,
          );
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
  private filterByDate(
    value: Date | null | undefined,
    condition: Date | null | undefined | Interfaces.DateWhereConditions,
  ): boolean {
    const valueAsNumber: number | null | undefined = value instanceof Date ? value.getTime() : value;

    if (_.isNil(condition)) {
      return valueAsNumber === condition;
    }

    if (condition instanceof Date) {
      return valueAsNumber === condition.getTime();
    }

    if (_.has(condition, 'in')) {
      if (Array.isArray(condition['in']) === false || _.isEmpty(condition['in'])) {
        return false;
      }
      const valueIndex = _.findIndex(condition['in'], (conditionValue) => {
        if (_.isNil(conditionValue)) {
          return valueAsNumber === conditionValue;
        }
        return valueAsNumber === conditionValue.getTime();
      });
      return valueIndex !== -1;
    }

    if (_.has(condition, '!in')) {
      if (Array.isArray(condition['!in']) === false || _.isEmpty(condition['!in'])) {
        return false;
      }
      const valueIndex = _.findIndex(condition['!in'], (conditionValue) => {
        if (_.isNil(conditionValue)) {
          return valueAsNumber === conditionValue;
        }
        return valueAsNumber === conditionValue.getTime();
      });
      return valueIndex === -1;
    }

    if (_.has(condition, '===')) {
      if (_.isNil(condition['==='])) {
        return valueAsNumber === condition['==='];
      }
      return valueAsNumber === condition['==='].getTime();
    }

    if (_.has(condition, '!==')) {
      if (_.isNil(condition['!=='])) {
        return valueAsNumber !== condition['!=='];
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
  private filterByBoolean(
    value: boolean | null | undefined,
    condition: boolean | null | undefined | Interfaces.BooleanWhereConditions,
  ): boolean {
    if (_.isNil(condition)) {
      return value === condition;
    }

    if (typeof condition === 'boolean') {
      return value === condition;
    }

    if (_.has(condition, '===')) {
      if (_.isNil(condition['==='])) {
        return value === condition['==='];
      }
      return value === condition['==='];
    }

    if (_.has(condition, '!==')) {
      if (_.isNil(condition['!=='])) {
        return value !== condition['!=='];
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
  private filterByString(
    value: string | null | undefined,
    condition: string | null | undefined | Interfaces.StringWhereConditions,
  ): boolean {
    if (_.isNil(condition)) {
      return value === condition;
    }

    if (typeof condition === 'string') {
      return value === condition;
    }

    if (_.has(condition, 'in')) {
      if (Array.isArray(condition['in']) === false || _.isEmpty(condition['in'])) {
        return false;
      }
      return _.includes(condition['in'], value);
    }

    if (_.has(condition, '!in')) {
      if (Array.isArray(condition['!in']) === false || _.isEmpty(condition['!in'])) {
        return false;
      }
      return _.includes(condition['!in'], value) === false;
    }

    if (_.has(condition, '===')) {
      if (_.isNil(condition['==='])) {
        return value === condition['==='];
      }
      return value === condition['==='];
    }

    if (_.has(condition, '!==')) {
      if (_.isNil(condition['!=='])) {
        return value !== condition['!=='];
      }
      return value !== condition['!=='];
    }

    if (_.has(condition, 'like')) {
      if (_.isNil(condition['like']) || _.isNil(value)) {
        return false;
      }

      if (typeof condition['like'] !== 'string' && condition['like'] instanceof RegExp === false) {
        return false;
      }

      const rgx = typeof condition['like'] === 'string' ? new RegExp(condition['like']) : condition['like'];
      return rgx.test(value);
    }

    if (_.has(condition, '!like')) {
      if (_.isNil(condition['!like']) || _.isNil(value)) {
        return false;
      }

      if (typeof condition['!like'] !== 'string' && condition['!like'] instanceof RegExp === false) {
        return false;
      }

      const rgx = typeof condition['!like'] === 'string' ? new RegExp(condition['!like']) : condition['!like'];
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
  private filterByNumber(
    value: number | null | undefined,
    condition: number | null | undefined | Interfaces.NumberWhereConditions,
  ): boolean {
    if (_.isNil(condition)) {
      return value === condition;
    }

    if (typeof condition === 'number') {
      return value === condition;
    }

    if (_.has(condition, 'in')) {
      if (Array.isArray(condition['in']) === false || _.isEmpty(condition['in'])) {
        return false;
      }
      return _.includes(condition['in'], value);
    }

    if (_.has(condition, '!in')) {
      if (Array.isArray(condition['!in']) === false || _.isEmpty(condition['!in'])) {
        return false;
      }
      return _.includes(condition['!in'], value) === false;
    }

    if (_.has(condition, '===')) {
      if (_.isNil(condition['==='])) {
        return value === condition['==='];
      }
      return value === condition['==='];
    }

    if (_.has(condition, '!==')) {
      if (_.isNil(condition['!=='])) {
        return value !== condition['!=='];
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
  private filterByRange(
    value: number | Date,
    condition: Interfaces.NumberWhereConditions | Interfaces.DateWhereConditions,
  ): boolean {
    if (_.has(condition, '>=')) {
      if (_.isNil(condition['>='])) {
        throw new Error(`WhereFilterHelper.filterByRange: ">=" condition can't contain "nil" value.`);
      }
      return value >= condition['>='];
    }

    if (_.has(condition, '>')) {
      if (_.isNil(condition['>'])) {
        throw new Error(`WhereFilterHelper.filterByRange: ">" condition can't contain "nil" value.`);
      }
      return value > condition['>'];
    }

    if (_.has(condition, '<=')) {
      if (_.isNil(condition['<='])) {
        throw new Error(`WhereFilterHelper.filterByRange: "<=" condition can't contain "nil" value.`);
      }
      return value <= condition['<='];
    }

    if (_.has(condition, '<')) {
      if (_.isNil(condition['<'])) {
        throw new Error(`WhereFilterHelper.filterByRange: "<" condition can't contain "nil" value.`);
      }
      return value < condition['<'];
    }

    if (_.has(condition, '[]')) {
      const conditionValue = condition['[]'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "[]" condition can't contain "nil" value.`);
      }

      return value >= conditionValue[0] && value <= conditionValue[1];
    }

    if (_.has(condition, '![]')) {
      const conditionValue = condition['![]'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "![]" condition can't contain "nil" value.`);
      }

      return !(value >= conditionValue[0] && value <= conditionValue[1]);
    }

    if (_.has(condition, '[)')) {
      const conditionValue = condition['[)'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "[)" condition can't contain "nil" value.`);
      }

      return value >= conditionValue[0] && value < conditionValue[1];
    }

    if (_.has(condition, '![)')) {
      const conditionValue = condition['![)'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "![)" condition can't contain "nil" value.`);
      }

      return !(value >= conditionValue[0] && value < conditionValue[1]);
    }

    if (_.has(condition, '(]')) {
      const conditionValue = condition['(]'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "(]" condition can't contain "nil" value.`);
      }

      return value > conditionValue[0] && value <= conditionValue[1];
    }

    if (_.has(condition, '!(]')) {
      const conditionValue = condition['!(]'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "!(]" condition can't contain "nil" value.`);
      }

      return !(value > conditionValue[0] && value <= conditionValue[1]);
    }

    if (_.has(condition, '()')) {
      const conditionValue = condition['()'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "()" condition can't contain "nil" value.`);
      }

      return value > conditionValue[0] && value < conditionValue[1];
    }

    if (_.has(condition, '!()')) {
      const conditionValue = condition['!()'];
      if (Array.isArray(conditionValue) === false || _.isEmpty(conditionValue)) {
        return false;
      }

      if (_.isNil(conditionValue[0]) || _.isNil(conditionValue[1])) {
        throw new Error(`WhereFilterHelper.filterByRange: "!()" condition can't contain "nil" value.`);
      }

      return !(value > conditionValue[0] && value < conditionValue[1]);
    }

    return false;
  }
}
