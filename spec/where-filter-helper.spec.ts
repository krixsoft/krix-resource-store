/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
// import * as sinon from 'sinon';
import 'reflect-metadata';

import { Enums, Interfaces } from '../dist';
import { WhereFilterHelper } from '../dist/where-filter.helper';

describe(`WhereFilterHelper`, () => {
  interface User {
    id: number;
    firstName: string;
    age: number;
    isAuthor: boolean;
    createdAt: Date;
    metadata?: object;
    role?: number;
    friendId?: number;
    friend?: User;
  }
  const schema: Interfaces.Schema<User> = {
    id: Enums.SchemaType.Number,
    firstName: Enums.SchemaType.String,
    age: Enums.SchemaType.Number,
    isAuthor: Enums.SchemaType.Boolean,
    createdAt: Enums.SchemaType.Date,
    metadata: Enums.SchemaType.Object,
    friendId: Enums.SchemaType.Number,
    role: {
      type: Enums.SchemaType.Computed,
      compute: () => {
        return 5;
      },
    },
    friend: {
      type: Enums.SchemaType.Relation,
      relation: Enums.RelationType.BelongsToMany,
      sourceProperty: 'friendId',
      resource: 'user',
    },
  };

  const whereFilterHelper = new WhereFilterHelper();

  const user: User = {
    id: 1,
    firstName: 'Andrey',
    age: 26,
    isAuthor: true,
    createdAt: new Date('2021-05-20T22:11:26.892Z'),
  };

  describe(`"Number" filter`, () => {

    it(`should return correct result with "direct value" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: 25,
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: 26,
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "===" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '===': 25 },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '===': 26 },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "!==" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!==': 26 },
      });
      expect(result1).to.be.false;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!==': 25 },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with ">" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>': 26 },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>': 27 },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>': 25 },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with ">=" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 27 },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 25 },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 26 },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "<" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<': 25 },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<': 26 },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<': 27 },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "<=" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<=': 25 },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<=': 26 },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '<=': 27 },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { 'in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { 'in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { 'in': [ 25, 27 ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { 'in': [ 25, 26 ] },
      });
      expect(result4).to.be.true;
    });

    it(`should return correct result with "!in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!in': [ 25, 27 ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!in': [ 25, 26 ] },
      });
      expect(result4).to.be.false;
    });

    it(`should return correct result with "()" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': [ 20, 25 ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': [ 25, 26 ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': [ 26, 30 ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': [ 25, 30 ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '()': [ 30, 35 ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "!()" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': [ 20, 25 ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': [ 25, 26 ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': [ 26, 30 ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': [ 25, 30 ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!()': [ 30, 35 ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "[)" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': [ 20, 25 ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': [ 25, 26 ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': [ 26, 30 ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': [ 25, 30 ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[)': [ 30, 35 ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "![)" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': [ 20, 25 ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': [ 25, 26 ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': [ 26, 30 ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': [ 25, 30 ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![)': [ 30, 35 ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "(]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': [ 20, 25 ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': [ 25, 26 ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': [ 26, 30 ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': [ 25, 30 ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '(]': [ 30, 35 ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "!(]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': [ 20, 25 ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': [ 25, 26 ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': [ 26, 30 ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': [ 25, 30 ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '!(]': [ 30, 35 ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "[]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': [ 20, 25 ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': [ 25, 26 ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': [ 26, 30 ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': [ 25, 30 ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '[]': [ 30, 35 ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "![]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': [ 20, 25 ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': [ 25, 26 ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': [ 26, 30 ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': [ 25, 30 ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '![]': [ 30, 35 ] },
      });
      expect(result6).to.be.true;
    });
  });

  describe(`"Date" filter`, () => {

    it(`should return correct result with "direct value" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: new Date('2021-05-19T22:11:26.892Z'),
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: new Date('2021-05-20T22:11:26.892Z'),
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "===" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '===': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '===': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "!==" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!==': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result1).to.be.false;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!==': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with ">" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>': new Date('2021-05-21T22:11:26.892Z') },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with ">=" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>=': new Date('2021-05-21T22:11:26.892Z') },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>=': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '>=': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "<" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<': new Date('2021-05-21T22:11:26.892Z') },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "<=" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<=': new Date('2021-05-19T22:11:26.892Z') },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<=': new Date('2021-05-20T22:11:26.892Z') },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '<=': new Date('2021-05-21T22:11:26.892Z') },
      });
      expect(result3).to.be.true;
    });

    it(`should return correct result with "in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { 'in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { 'in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { 'in': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-21T22:11:26.892Z') ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { 'in': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result4).to.be.true;
    });

    it(`should return correct result with "!in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!in': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-21T22:11:26.892Z') ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!in': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result4).to.be.false;
    });

    it(`should return correct result with "()" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '()': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "!()" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!()': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "[)" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[)': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "![)" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![)': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "(]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '(]': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "!(]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '!(]': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.true;
    });

    it(`should return correct result with "[]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.true;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.true;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '[]': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.false;
    });

    it(`should return correct result with "![]" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': [ new Date('2021-05-10T22:11:26.892Z'), new Date('2021-05-15T22:11:26.892Z') ] },
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': [ new Date('2021-05-15T22:11:26.892Z'), new Date('2021-05-20T22:11:26.892Z') ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': [ new Date('2021-05-20T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': [ new Date('2021-05-19T22:11:26.892Z'), new Date('2021-05-25T22:11:26.892Z') ] },
      });
      expect(result5).to.be.false;
      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        createdAt: { '![]': [ new Date('2021-05-25T22:11:26.892Z'), new Date('2021-05-30T22:11:26.892Z') ] },
      });
      expect(result6).to.be.true;
    });
  });

  describe(`"Boolean" filter`, () => {

    it(`should return correct result with "direct value" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: false,
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: true,
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "===" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: { '===': false },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: { '===': true },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "!==" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: { '!==': true },
      });
      expect(result1).to.be.false;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        isAuthor: { '!==': false },
      });
      expect(result2).to.be.true;
    });
  });

  describe(`"String" filter`, () => {

    it(`should return correct result with "direct value" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: 'Artur',
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: 'Andrey',
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "===" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '===': 'Artur' },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '===': 'Andrey' },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "!==" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!==': 'Andrey' },
      });
      expect(result1).to.be.false;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!==': 'Artur' },
      });
      expect(result2).to.be.true;
    });

    it(`should return correct result with "in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'in': [ 'Artur', 'Roma' ] },
      });
      expect(result3).to.be.false;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'in': [ 'Artur', 'Andrey' ] },
      });
      expect(result4).to.be.true;
    });

    it(`should return correct result with "!in" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!in': null },
      });
      expect(result1).to.be.false;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!in': [] },
      });
      expect(result2).to.be.false;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!in': [ 'Artur', 'Roma' ] },
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!in': [ 'Artur', 'Andrey' ] },
      });
      expect(result4).to.be.false;
    });

    it(`should return correct result with "like" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': 'Artur' },
      });
      expect(result1).to.be.false;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': 'Andrey' },
      });
      expect(result2).to.be.true;

      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': 'A' },
      });
      expect(result3).to.be.true;

      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': null },
      });
      expect(result4).to.be.false;

      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': /Andrey/ },
      });
      expect(result5).to.be.true;

      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': /Ar/ },
      });
      expect(result6).to.be.false;

      const result7 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': /.+/ },
      });
      expect(result7).to.be.true;

      const result8 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { 'like': /^A.+/ },
      });
      expect(result8).to.be.true;
    });

    it(`should return correct result with "!like" predicate`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': 'Artur' },
      });
      expect(result1).to.be.true;

      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': 'Andrey' },
      });
      expect(result2).to.be.false;

      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': 'A' },
      });
      expect(result3).to.be.false;

      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': null },
      });
      expect(result4).to.be.false;

      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': /Andrey/ },
      });
      expect(result5).to.be.false;

      const result6 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': /Ar/ },
      });
      expect(result6).to.be.true;

      const result7 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': /.+/ },
      });
      expect(result7).to.be.false;

      const result8 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: { '!like': /^A.+/ },
      });
      expect(result8).to.be.false;
    });
  });

  describe(`Params tests`, () => {

    it(`should throw an error if field has unsupported type`, () => {
      let testError: Error;
      try {
        whereFilterHelper.filterByCondition(schema, user, {
          friend: user,
        } as any);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`WhereFilterHelper.filterByCondition: "Where" condition can only filter "Number", "Boolean", "String" and "Date" fields.`);

      testError = undefined;
      try {
        whereFilterHelper.filterByCondition(schema, user, {
          role: 5,
        } as any);
      } catch (error) {
        testError = error;
      }

      testError = undefined;
      try {
        whereFilterHelper.filterByCondition(schema, user, {
          metadata: {},
        } as any);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`WhereFilterHelper.filterByCondition: "Where" condition can only filter "Number", "Boolean", "String" and "Date" fields.`);
    });

    it(`should throw an error if where condition is "nil" or empty`, () => {
      let testError: Error;
      try {
        whereFilterHelper.filterByCondition(schema, user, null);
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`WhereFilterHelper.filterByCondition: "Where" condition is required.`);

      testError = undefined;
      try {
        whereFilterHelper.filterByCondition(schema, user, {});
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`WhereFilterHelper.filterByCondition: "Where" condition must have at least 1 field.`);
    });

    it(`should filter by 2+ fields`, () => {
      const result1 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 26 },
      });
      expect(result1).to.be.true;
      const result2 = whereFilterHelper.filterByCondition(schema, user, {
        firstName: 'Andrey',
      });
      expect(result2).to.be.true;
      const result3 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 26 },
        firstName: 'Andrey',
      });
      expect(result3).to.be.true;
      const result4 = whereFilterHelper.filterByCondition(schema, user, {
        age: { '>=': 26 },
        firstName: 'Artur',
      });
      expect(result4).to.be.false;
      const result5 = whereFilterHelper.filterByCondition(schema, user, {
        age: 27,
        firstName: 'Andrey',
      });
      expect(result5).to.be.false;
    });
  });
});
