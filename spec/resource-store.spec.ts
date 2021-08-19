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

  describe(`Schema - "Base" simple fields`, () => {
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

  describe(`Schema - "Base" complex fields`, () => {
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
  });

  describe(`Schema - "Computed" complex field`, () => {
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

  describe(`Schema - "Relation" complex field`, () => {
    it(`should allow to inject resource with complex "Relation" field`, () => {
      interface User {
        id: number;
        friendId: number;
        friend?: User;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friend: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToMany,
            sourceProperty: 'friendId',
            resource: 'user',
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user: User = {
        id: 1,
        friendId: 2,
      };
      const injectedUser = userResourceStore.inject(user);

      expect(injectedUser.id).to.be.equal(user.id);
    });

    it(`should throw an error after getting of the related field if relation map isn't assigned to store`, () => {
      interface User {
        id: number;
        friendId: number;
        friend?: User;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friend: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToMany,
            sourceProperty: 'friendId',
            resource: 'user',
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const user: User = {
        id: 1,
        friendId: 2,
      };
      const injectedUser = userResourceStore.inject(user);

      let testError: Error;
      try {
        injectedUser.friend;
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`ResourceStore.getIncludeValue: We can't find a map with resource stores in the resource store (user).`);
    });

    it(`should throw an error after getting of the related field if relation map doesn't contain the related store`, () => {
      interface User {
        id: number;
        friendId: number;
        friend?: User;
      }
      class UserResourceStore extends ResourceStore<User> {
        public name = 'user';

        public schema: Interfaces.Schema<User> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friend: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToMany,
            sourceProperty: 'friendId',
            resource: 'user',
          },
        };
      }
      const userResourceStore = new UserResourceStore();
      const relationMap = new Map();
      userResourceStore.relationMap = relationMap;

      const user: User = {
        id: 1,
        friendId: 2,
      };
      const injectedUser = userResourceStore.inject(user);

      let testError: Error;
      try {
        injectedUser.friend;
      } catch (error) {
        testError = error;
      }

      expect(testError).not.to.be.undefined;
      expect(testError.message).to.be.equal(`ResourceStore.getIncludeValue: We can't find the resource store (user) in relation map.`);
    });

    describe(`BelongsToOne`, () => {
      interface UserWithFriend {
        id: number;
        friendId: number;
        friend?: UserWithFriend;
      }
      class UserWithFriendResourceStore extends ResourceStore<UserWithFriend> {
        public name = 'userWithFriend';

        public schema: Interfaces.Schema<UserWithFriend> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friend: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToOne,
            sourceProperty: 'friendId',
            resource: 'userWithFriend',
          },
        };
      }
      let userWithFriendResourceStore: UserWithFriendResourceStore;

      interface Role {
        id: number;
        name: string;
      }
      class RoleStore extends ResourceStore<Role> {
        public name = 'role';

        public schema: Interfaces.Schema<Role> = {
          id: Enums.SchemaType.Number,
          name: Enums.SchemaType.String,
        };
      }
      let roleStore: RoleStore;

      interface UserWithRole {
        id: number;
        roleId: number;
        role?: UserWithRole;
      }
      class UserWithRoleResourceStore extends ResourceStore<UserWithRole> {
        public name = 'userWithRole';

        public schema: Interfaces.Schema<UserWithRole> = {
          id: Enums.SchemaType.Number,
          roleId: Enums.SchemaType.Number,
          role: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToOne,
            sourceProperty: 'roleId',
            resource: 'role',
          },
        };
      }
      let userWithRoleResourceStore: UserWithRoleResourceStore;

      const relationMap = new Map();

      beforeEach(() => {
        relationMap.clear();

        userWithFriendResourceStore = new UserWithFriendResourceStore();
        relationMap.set(userWithFriendResourceStore.name, userWithFriendResourceStore);
        userWithFriendResourceStore.relationMap = relationMap;

        roleStore = new RoleStore();
        relationMap.set(roleStore.name, roleStore);
        roleStore.relationMap = relationMap;

        userWithRoleResourceStore = new UserWithRoleResourceStore();
        relationMap.set(userWithRoleResourceStore.name, userWithRoleResourceStore);
        userWithRoleResourceStore.relationMap = relationMap;
      });

      it(`should return "null" if source field contains "nil" value`, () => {
        const user = userWithFriendResourceStore.inject({
          id: 1,
          friendId: null,
        });

        expect(user.friend).to.be.null;
      });

      it(`should return "null" if relation not found in the related store for one store`, () => {
        const user = userWithFriendResourceStore.inject({
          id: 1,
          friendId: 2,
        });

        expect(user.friend).to.be.null;
      });

      it(`should return related resource (link to resource) for one store`, () => {
        const injectedUser1 = userWithFriendResourceStore.inject({
          id: 1,
          friendId: 2,
        });

        const injectedUser2 = userWithFriendResourceStore.inject({
          id: 2,
          friendId: null,
        });

        expect(injectedUser1.friend).to.be.equal(injectedUser2);
      });

      it(`should return "null" if relation not found in the related store for two stores`, () => {
        const user = userWithRoleResourceStore.inject({
          id: 1,
          roleId: 1,
        });

        expect(user.role).to.be.null;
      });

      it(`should return related resource (link to resource) for two stores`, () => {
        const role = roleStore.inject({
          id: 1,
          name: 'Admin',
        });

        const user = userWithRoleResourceStore.inject({
          id: 1,
          roleId: 1,
        });

        expect(user.role).to.be.equal(role);
      });
    });

    describe(`BelongsToMany`, () => {
      interface UserWithFriends {
        id: number;
        friendsIds: number[];
        friends?: UserWithFriends[];
      }
      class UserWithFriendsResourceStore extends ResourceStore<UserWithFriends> {
        public name = 'userWithFriends';

        public schema: Interfaces.Schema<UserWithFriends> = {
          id: Enums.SchemaType.Number,
          friendsIds: Enums.SchemaType.Object,
          friends: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToMany,
            sourceProperty: 'friendsIds',
            resource: 'userWithFriends',
          },
        };
      }
      let userWithFriendsResourceStore: UserWithFriendsResourceStore;

      interface Role {
        id: number;
        name: string;
      }
      class RoleStore extends ResourceStore<Role> {
        public name = 'role';

        public schema: Interfaces.Schema<Role> = {
          id: Enums.SchemaType.Number,
          name: Enums.SchemaType.String,
        };
      }
      let roleStore: RoleStore;

      interface UserWithRoles {
        id: number;
        rolesIds: number[];
        roles?: UserWithRoles[];
      }
      class UserWithRolesResourceStore extends ResourceStore<UserWithRoles> {
        public name = 'userWithRoles';

        public schema: Interfaces.Schema<UserWithRoles> = {
          id: Enums.SchemaType.Number,
          rolesIds: Enums.SchemaType.Object,
          roles: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.BelongsToMany,
            sourceProperty: 'rolesIds',
            resource: 'role',
          },
        };
      }
      let userWithRolesResourceStore: UserWithRolesResourceStore;

      const relationMap = new Map();

      beforeEach(() => {
        relationMap.clear();

        userWithFriendsResourceStore = new UserWithFriendsResourceStore();
        relationMap.set(userWithFriendsResourceStore.name, userWithFriendsResourceStore);
        userWithFriendsResourceStore.relationMap = relationMap;

        roleStore = new RoleStore();
        relationMap.set(roleStore.name, roleStore);
        roleStore.relationMap = relationMap;

        userWithRolesResourceStore = new UserWithRolesResourceStore();
        relationMap.set(userWithRolesResourceStore.name, userWithRolesResourceStore);
        userWithRolesResourceStore.relationMap = relationMap;
      });

      it(`should return empty array if source field contains "nil" value`, () => {
        const user = userWithFriendsResourceStore.inject({
          id: 1,
          friendsIds: null,
        });

        expect(user.friends).to.be.an('array').that.is.empty;
      });

      it(`should return empty array if source field contains empty array of ids`, () => {
        const user = userWithFriendsResourceStore.inject({
          id: 1,
          friendsIds: [],
        });

        expect(user.friends).to.be.an('array').that.is.empty;
      });

      it(`should return empty array if relations not found in the related store for one store`, () => {
        const user = userWithFriendsResourceStore.inject({
          id: 1,
          friendsIds: [ 3, 2 ],
        });

        expect(user.friends).to.be.an('array').that.is.empty;
      });

      it(`should return related resources (link to resources) for one store`, () => {
        const user1 = userWithFriendsResourceStore.inject({
          id: 1,
          friendsIds: [ 3, 2 ],
        });
        const user2 = userWithFriendsResourceStore.inject({
          id: 2,
          friendsIds: [],
        });
        const user3 = userWithFriendsResourceStore.inject({
          id: 3,
          friendsIds: [],
        });

        const friends = user1.friends;
        expect(friends).to.have.lengthOf(2);
        expect(friends).to.include(user2);
        expect(friends).to.include(user3);
      });

      it(`should return empty array if relation not found in the related store for two stores`, () => {
        const user = userWithRolesResourceStore.inject({
          id: 1,
          rolesIds: [ 1 ],
        });

        expect(user.roles).to.be.an('array').that.is.empty;
      });

      it(`should return related resources (link to resources) for two stores`, () => {
        const role1 = roleStore.inject({
          id: 1,
          name: 'Admin',
        });
        const role2 = roleStore.inject({
          id: 2,
          name: 'Guest',
        });
        const user1 = userWithRolesResourceStore.inject({
          id: 1,
          rolesIds: [ 1, 2 ],
        });

        const roles = user1.roles;
        expect(roles).to.have.lengthOf(2);
        expect(roles).to.include(role1);
        expect(roles).to.include(role2);
      });
    });

    describe(`HasOne`, () => {
      interface UserWithFriend {
        id: number;
        friendId: number;
        friend?: UserWithFriend;
      }
      class UserWithFriendResourceStore extends ResourceStore<UserWithFriend> {
        public name = 'userWithFriend';

        public schema: Interfaces.Schema<UserWithFriend> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friend: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.HasOne,
            targetProperty: 'friendId',
            resource: 'userWithFriend',
          },
        };
      }
      let userWithFriendResourceStore: UserWithFriendResourceStore;

      interface Book {
        id: number;
        name: string;
        authorId: number;
      }
      class BookStore extends ResourceStore<Book> {
        public name = 'book';

        public schema: Interfaces.Schema<Book> = {
          id: Enums.SchemaType.Number,
          name: Enums.SchemaType.String,
          authorId: Enums.SchemaType.Number,
        };
      }
      let bookStore: BookStore;

      interface UserWithBook {
        id: number;
        book?: UserWithBook;
      }
      class UserWithBookResourceStore extends ResourceStore<UserWithBook> {
        public name = 'userWithBook';

        public schema: Interfaces.Schema<UserWithBook> = {
          id: Enums.SchemaType.Number,
          book: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.HasOne,
            targetProperty: 'authorId',
            resource: 'book',
          },
        };
      }
      let userWithBookResourceStore: UserWithBookResourceStore;

      const relationMap = new Map();

      beforeEach(() => {
        relationMap.clear();

        userWithFriendResourceStore = new UserWithFriendResourceStore();
        relationMap.set(userWithFriendResourceStore.name, userWithFriendResourceStore);
        userWithFriendResourceStore.relationMap = relationMap;

        bookStore = new BookStore();
        relationMap.set(bookStore.name, bookStore);
        bookStore.relationMap = relationMap;

        userWithBookResourceStore = new UserWithBookResourceStore();
        relationMap.set(userWithBookResourceStore.name, userWithBookResourceStore);
        userWithBookResourceStore.relationMap = relationMap;
      });

      it(`should return "null" if source field contains "nil" value`, () => {
        const user = userWithFriendResourceStore.inject({
          id: 1,
          friendId: null,
        });

        expect(user.friend).to.be.null;
      });

      it(`should return "null" if relation not found in the related store for one store`, () => {
        const user = userWithFriendResourceStore.inject({
          id: 1,
          friendId: 2,
        });

        expect(user.friend).to.be.null;
      });

      it(`should return related resource (link to resource) for one store`, () => {
        const injectedUser1 = userWithFriendResourceStore.inject({
          id: 1,
          friendId: null,
        });

        const injectedUser2 = userWithFriendResourceStore.inject({
          id: 2,
          friendId: 1,
        });

        expect(injectedUser1.friend).to.be.equal(injectedUser2);
      });

      it(`should return "null" if relation not found in the related store for two stores`, () => {
        const user = userWithBookResourceStore.inject({
          id: 1,
        });

        expect(user.book).to.be.null;
      });

      it(`should return related resource (link to resource) for two stores`, () => {
        const book = bookStore.inject({
          id: 1,
          name: 'Vavilon',
          authorId: 1,
        });

        const user = userWithBookResourceStore.inject({
          id: 1,
        });

        expect(user.book).to.be.equal(book);
      });
    });

    describe(`HasMany`, () => {
      interface UserWithFriends {
        id: number;
        friendId: number;
        friends?: UserWithFriends[];
      }
      class UserWithFriendsResourceStore extends ResourceStore<UserWithFriends> {
        public name = 'userWithFriends';

        public schema: Interfaces.Schema<UserWithFriends> = {
          id: Enums.SchemaType.Number,
          friendId: Enums.SchemaType.Number,
          friends: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.HasMany,
            targetProperty: 'friendId',
            resource: 'userWithFriends',
          },
        };
      }
      let userWithFriendsResourceStore: UserWithFriendsResourceStore;

      interface Book {
        id: number;
        name: string;
        authorId: number;
      }
      class BookStore extends ResourceStore<Book> {
        public name = 'book';

        public schema: Interfaces.Schema<Book> = {
          id: Enums.SchemaType.Number,
          name: Enums.SchemaType.String,
          authorId: Enums.SchemaType.Number,
        };
      }
      let bookStore: BookStore;

      interface UserWithBooks {
        id: number;
        books?: UserWithBooks[];
      }
      class UserWithRolesResourceStore extends ResourceStore<UserWithBooks> {
        public name = 'userWithBooks';

        public schema: Interfaces.Schema<UserWithBooks> = {
          id: Enums.SchemaType.Number,
          books: {
            type: Enums.SchemaType.Relation,
            relation: Enums.RelationType.HasMany,
            targetProperty: 'authorId',
            resource: 'book',
          },
        };
      }
      let userWithBooksResourceStore: UserWithRolesResourceStore;

      const relationMap = new Map();

      beforeEach(() => {
        relationMap.clear();

        userWithFriendsResourceStore = new UserWithFriendsResourceStore();
        relationMap.set(userWithFriendsResourceStore.name, userWithFriendsResourceStore);
        userWithFriendsResourceStore.relationMap = relationMap;

        bookStore = new BookStore();
        relationMap.set(bookStore.name, bookStore);
        bookStore.relationMap = relationMap;

        userWithBooksResourceStore = new UserWithRolesResourceStore();
        relationMap.set(userWithBooksResourceStore.name, userWithBooksResourceStore);
        userWithBooksResourceStore.relationMap = relationMap;
      });

      it(`should return empty array if relations not found in the empty related store for one store`, () => {
        const user = userWithFriendsResourceStore.inject({
          id: 1,
          friendId: null,
        });

        expect(user.friends).to.be.an('array').that.is.empty;
      });

      it(`should return empty array if relations not found in the not-empty related store for one store`, () => {
        const user = userWithFriendsResourceStore.inject({
          id: 1,
          friendId: null,
        });
        userWithFriendsResourceStore.inject({
          id: 2,
          friendId: null,
        });

        expect(user.friends).to.be.an('array').that.is.empty;
      });

      it(`should return related resources (link to resources) for one store`, () => {
        const user1 = userWithFriendsResourceStore.inject({
          id: 1,
          friendId: null,
        });
        const user2 = userWithFriendsResourceStore.inject({
          id: 2,
          friendId: 1,
        });
        const user3 = userWithFriendsResourceStore.inject({
          id: 3,
          friendId: 1,
        });

        const friends = user1.friends;
        expect(friends).to.have.lengthOf(2);
        expect(friends).to.include(user2);
        expect(friends).to.include(user3);
      });

      it(`should return empty array if relation not found in the empty related store for two stores`, () => {
        const user = userWithBooksResourceStore.inject({
          id: 1,
        });

        expect(user.books).to.be.an('array').that.is.empty;
      });

      it(`should return empty array if relation not found in the not-empty related store for two stores`, () => {
        const user = userWithBooksResourceStore.inject({
          id: 1,
        });

        bookStore.inject({
          id: 1,
          name: 'Book 1',
          authorId: null,
        });

        expect(user.books).to.be.an('array').that.is.empty;
      });

      it(`should return related resources (link to resources) for two stores`, () => {
        const user = userWithBooksResourceStore.inject({
          id: 1,
        });

        const book1 = bookStore.inject({
          id: 1,
          name: 'Book 1',
          authorId: 1,
        });
        const book2 = bookStore.inject({
          id: 2,
          name: 'Book 2',
          authorId: 1,
        });

        const books = user.books;
        expect(books).to.have.lengthOf(2);
        expect(books).to.include(book1);
        expect(books).to.include(book2);
      });
    });
  });
});
