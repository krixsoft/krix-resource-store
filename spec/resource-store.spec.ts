/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
// import * as sinon from 'sinon';
import 'reflect-metadata';

import { ResourceStore, Enums, Interfaces } from '../dist';

describe(`KxModule`, () => {

  it(`should create an instance of Resource store`, () => {
    interface User {
      firstName: string
      lastName: string
    }

    class UserResourceStore extends ResourceStore<User> {
      public name = 'user';

      public schema: Interfaces.Schema<User> = {
        firstName: {
          type: Enums.SchemaType.String,
          required: true,
        },
        lastName: {
          type: Enums.SchemaType.String,
          required: true,
        },
      };
    }

    const userResourceStore = new UserResourceStore();
    expect(userResourceStore).to.be.an.instanceOf(UserResourceStore);
  });

  describe(`inject`, () => {
    interface User {
      firstName: string
      lastName: string
    }
    class UserResourceStore extends ResourceStore<User> {
      public name = 'user';

      public schema: Interfaces.Schema<User> = {
        firstName: {
          type: Enums.SchemaType.String,
          required: true,
        },
        lastName: {
          type: Enums.SchemaType.String,
        },
      };
    }
    let userResourceStore: UserResourceStore;

    beforeEach(() => {
      userResourceStore = new UserResourceStore();
    });

    it(`should inject an object and result resource should be another object`, () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser).not.to.be.equal(user);
    });

    it('should inject a full object', () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.firstName).to.be.equal(user.firstName);
      expect(injectedUser.lastName).to.be.equal(user.lastName);
    });

    it('should inject a not-full object', () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
      } as any as User;
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.firstName).to.be.equal(user.firstName);
      expect(injectedUser.lastName).to.be.undefined;
    });

    it('should inject a full object with non-schema field', () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
        middleName: 'Ivanovich',
      } as any as User;
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.firstName).to.be.equal(user.firstName);
      expect(injectedUser.lastName).to.be.equal(user.lastName);
      expect((injectedUser as any).middleName).to.be.undefined;
    });

    it('should allow to reinject resource and it should be another object', () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
      } as any as User;
      const injectedUser = userResourceStore.inject(user);
      const injectedCopyUser = userResourceStore.inject(user);

      expect(injectedCopyUser).not.to.be.equal(injectedUser);
    });

    it('should allow to reinject resource and their fields should be equal', () => {
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
      } as any as User;
      const injectedUser = userResourceStore.inject(user);
      const injectedCopyUser = userResourceStore.inject(user);

      expect(injectedCopyUser.firstName).to.be.equal(injectedUser.firstName);
      expect(injectedCopyUser.lastName).to.be.equal(injectedUser.lastName);
    });
  });

});
