
type PropertyName = string | number | symbol;
type ShortIterator = [ PropertyName, any ];
type FunctionIterator <T> = (value: T, index?: number) => boolean;
type FunctionMapIterator <T> = (value: T, index?: number) => any;
type Iterator <T> = ShortIterator | FunctionIterator<T>;

export class Helper {

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * @param  {any} object
   * @return {string[]}
   */
  static keys (
    object: any,
  ): string[] {
    const result = [];
    for (const key in Object(object)) {
      if (Helper.has(object, key) && key !== 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of values by running each element in collection thru iteratee.
   * The iteratee is invoked with three arguments: (value, index|key, collection).
   *
   * @param  {T[]} arr
   * @param  {FunctionMapIterator<T>} iterator
   * @return {T[]}
   */
  static map <T> (
    arr: T[],
    iterator: FunctionMapIterator<T>,
  ): T[] {
    if (Helper.isEmpty(arr) === true) {
      return [];
    }

    return arr.map<T>(iterator);
  }

  /**
   * Iterates over elements of collection, returning an array of all elements predicate returns truthy for. The
   * predicate is invoked with three arguments: (value, index).
   *
   * @param  {T[]} arr
   * @param  {Iterator<T>} iterator
   * @return {T}
   */
  static filter <T> (
    arr: T[],
    iterator: Iterator<T>,
  ): T[] {
    if (Helper.isEmpty(arr) === true) {
      return [];
    }

    if (typeof iterator === 'function') {
      return arr.filter(iterator);
    }

    const propertyName = iterator[0];
    const propertyValue = iterator[1];
    const filteredArray = arr.filter((element) => {
      return (element as any)[propertyName] === propertyValue;
    });

    return filteredArray;
  }

  /**
   * The opposite of _.filter; this method returns the elements of collection that predicate does not return truthy for.
   *
   * @param  {T[]} arr
   * @param  {Iterator<T>} iterator
   * @return {T}
   */
  static reject <T> (
    arr: T[],
    iterator: Iterator<T>,
  ): T[] {
    if (Helper.isEmpty(arr) === true) {
      return [];
    }

    if (typeof iterator === 'function') {
      return arr.filter((value, index) => {
        return iterator(value, index) === false;
      });
    }

    const propertyName = iterator[0];
    const propertyValue = iterator[1];
    const filteredArray = arr.filter((element) => {
      return (element as any)[propertyName] !== propertyValue;
    });

    return filteredArray;
  }

  /**
   * Checks if predicate returns truthy for all elements of collection. Iteration is stopped once predicate
   * returns falsey. The predicate is invoked with three arguments: (value, index|key, collection).
   *
   * @param  {T[]} arr
   * @param  {Iterator<T>} iterator
   * @return {boolean}
   */
  static every <T> (
    arr: T[],
    iterator: Iterator<T>,
  ): boolean {
    if (Helper.isEmpty(arr) === true) {
      return true;
    }

    if (typeof iterator === 'function') {
      return arr.every(iterator);
    }

    const propertyName = iterator[0];
    const propertyValue = iterator[1];
    return arr.every((element) => {
      return (element as any)[propertyName] === propertyValue;
    });
  }

  /**
   * Checks if target is in collection using SameValueZero for equality comparisons. If fromIndex is negative,
   * it’s used as the offset from the end of collection.
   *
   * @param  {T[]} arr
   * @param  {T} value
   * @return {boolean}
   */
  static includes <T> (
    arr: T[],
    value: T,
  ): boolean {
    if (Helper.isEmpty(arr) === true) {
      return false;
    }

    return arr.includes(value);
  }

  /**
   * This method is like _.find except that it returns the index of the first element predicate returns truthy
   * for instead of the element itself.
   *
   * @param  {T[]} arr
   * @param  {Iterator<T>} iterator
   * @return {number}
   */
  static findIndex <T> (
    arr: T[],
    iterator: Iterator<T>,
  ): number {
    if (Helper.isEmpty(arr) === true) {
      return null;
    }

    let foundIndex = -1;
    if (typeof iterator === 'function') {
      arr.find((value, index) => {
        const valueIsMatched = iterator(value, index);
        if (valueIsMatched === true) {
          foundIndex = index;
        }
        return valueIsMatched;
      });
      return foundIndex;
    }

    const propertyName = iterator[0];
    const propertyValue = iterator[1];

    arr.find((element, index) => {
      const valueIsMatched = (element as any)[propertyName] === propertyValue;
      if (valueIsMatched === true) {
        foundIndex = index;
      }
      return valueIsMatched;
    });

    return foundIndex;
  }

  /**
   * Iterates over elements of collection, returning the first element predicate returns truthy for.
   * The predicate is invoked with three arguments: (value, index).
   *
   * @param  {T[]} arr
   * @param  {Iterator<T>} iterator
   * @return {T}
   */
  static find <T> (
    arr: T[],
    iterator: Iterator<T>,
  ): T {
    if (Helper.isEmpty(arr) === true) {
      return null;
    }

    if (typeof iterator === 'function') {
      return arr.find(iterator);
    }

    const propertyName = iterator[0];
    const propertyValue = iterator[1];
    return arr.find((element) => {
      return (element as any)[propertyName] === propertyValue;
    });
  }

  /**
   * Returns `true` if the object is an array.
   *
   * @param  {any[]} arr
   * @return {boolean}
   */
  static isArray (
    arr: any,
  ): arr is any[] {
    return Array.isArray(arr) === true;
  }

  /**
   * Returns `true` if the object is an empty array.
   *
   * @param  {any[]} arr
   * @return {boolean}
   */
  static isEmpty (
    arr: any[],
  ): boolean {
    return Helper.isArray(arr) === true && arr.length === 0;
  }

  /**
   * Returns `true` if the object has own property `propertyName`.
   *
   * @param  {any} obj
   * @param  {string} propertyName
   * @return {boolean}
   */
  static has (
    obj: unknown,
    propertyName: string,
  ): boolean {
    return typeof obj === 'object'
      && Object.prototype.hasOwnProperty.call(obj, propertyName);
  }

  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @param  {unknown} value
   * @return {boolean}
   */
  static isNil (value: unknown): value is null {
    return value === null || value === undefined;
  }
}
