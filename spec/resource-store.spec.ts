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

  describe(`Schema - Simple fields`, () => {
    it(`should allow to inject resource with simple "Number" field`, () => {
      interface User {
        age: number;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          age: Enums.SchemaType.Number,
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        age: 26,
      };
      const injectedUser = userResourceStore.inject(user);
      expect(injectedUser.age).to.be.equal(user.age);
    });

    it(`should allow to inject resource with simple "String" field`, () => {
      interface User {
        name: string;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          name: Enums.SchemaType.String,
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        name: `Andrey`,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.name).to.be.equal(user.name);
    });

    it(`should allow to inject resource with simple "Boolean" field`, () => {
      interface User {
        hasHome: boolean;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          hasHome: Enums.SchemaType.Boolean,
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        hasHome: true,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.hasHome).to.be.equal(user.hasHome);
    });

    it(`should allow to inject resource with simple "Date" field (date in ISO format as "string")`, () => {
      interface User {
        birthday: Date;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          birthday: Enums.SchemaType.Date,
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        birthday: `2021-08-18T22:25:12.581Z`,
      } as any as User;
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.birthday).to.be.an.instanceOf(Date);
      expect(injectedUser.birthday.toISOString()).to.be.equal(user.birthday);
    });

    it(`should allow to inject resource with simple "Date" field (date as "Date" object)`, () => {
      interface User {
        birthday: Date;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          birthday: Enums.SchemaType.Date,
        };
      }
      const userResourceStore = new UserResourceStore();
      const isoString = `2021-08-18T22:25:12.581Z`;
      const user = {
        id: 1,
        birthday: new Date(isoString),
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.birthday).to.be.an.instanceOf(Date);
      expect(injectedUser.birthday.toISOString()).to.be.equal((new Date(isoString)).toISOString());
    });

    it(`should allow to inject resource with simple "Object" field`, () => {
      interface User {
        metainfo: object;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          metainfo: Enums.SchemaType.Object,
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        metainfo: { role: 5 },
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.metainfo).to.be.equal(user.metainfo);
    });
  });

  describe(`Schema - Complex fields`, () => {
    it(`should allow to inject resource with complex "Number" field`, () => {
      interface User {
        age: number;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          age: {
            type: Enums.SchemaType.Number,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        age: 26,
      };
      const injectedUser = userResourceStore.inject(user);
      expect(injectedUser.age).to.be.equal(user.age);
    });

    it(`should allow to inject resource with complex "String" field`, () => {
      interface User {
        name: string;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          name: {
            type: Enums.SchemaType.String,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        name: `Andrey`,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.name).to.be.equal(user.name);
    });

    it(`should allow to inject resource with complex "Boolean" field`, () => {
      interface User {
        hasHome: boolean;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          hasHome: {
            type: Enums.SchemaType.Boolean,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        hasHome: true,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.hasHome).to.be.equal(user.hasHome);
    });

    it(`should allow to inject resource with complex "Date" field (date in ISO format as "string")`, () => {
      interface User {
        birthday: Date;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          birthday: {
            type: Enums.SchemaType.Date,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        birthday: `2021-08-18T22:25:12.581Z`,
      } as any as User;
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.birthday).to.be.an.instanceOf(Date);
      expect(injectedUser.birthday.toISOString()).to.be.equal(user.birthday);
    });

    it(`should allow to inject resource with complex "Date" field (date as "Date" object)`, () => {
      interface User {
        birthday: Date;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          birthday: {
            type: Enums.SchemaType.Date,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const isoString = `2021-08-18T22:25:12.581Z`;
      const user = {
        id: 1,
        birthday: new Date(isoString),
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.birthday).to.be.an.instanceOf(Date);
      expect(injectedUser.birthday.toISOString()).to.be.equal((new Date(isoString)).toISOString());
    });

    it(`should allow to inject resource with complex "Object" field`, () => {
      interface User {
        metainfo: object;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          metainfo: {
            type: Enums.SchemaType.Object,
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        metainfo: { role: 5 },
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.metainfo).to.be.equal(user.metainfo);
    });

    it(`should allow to inject resource with complex "Computed" field`, () => {
      interface User {
        firstName: string;
        lastName: string;
        fullName?: string;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          firstName: Enums.SchemaType.String,
          lastName: Enums.SchemaType.String,
          fullName: {
            type: Enums.SchemaType.Computed,
            compute: (resource) => {
              return `${resource.firstName} ${resource.lastName}`;
            },
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        firstName: 'Ivan',
        lastName: 'Petrov',
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.fullName).to.be.equal(`${injectedUser.firstName} ${injectedUser.lastName}`);
    });

    it(`should get non-cached values from "Computed" field`, () => {
      interface User {
        id: number;
        randomValue?: number;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          id: Enums.SchemaType.Number,
          randomValue: {
            type: Enums.SchemaType.Computed,
            compute: () => {
              return Math.random();
            },
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.randomValue).not.to.be.equal(injectedUser.randomValue);
    });

    it(`shouldn't redefine "Computed" field after inject`, () => {
      interface User {
        id: number;
        role?: number;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          id: Enums.SchemaType.Number,
          role: {
            type: Enums.SchemaType.Computed,
            compute: () => {
              return 5;
            },
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user = {
        id: 1,
        role: 1,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.role).to.be.equal(5);
      expect(injectedUser.role).not.to.be.equal(user.role);
    });
  });

});
