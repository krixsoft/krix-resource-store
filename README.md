**krix/resource-store** - a library which provides a high-level ORM with in-memory storage to manage collection-like data. It's an independent part of Krix ecosystem.

# Installation
```
npm install -S @krix/resource-store
```

# Introduction
## What for?
How to store users? Everybody knows `Redux` and uses it for a such issue. Redux-like libraries providers very simple interface and often developers implements "iteration", "observation" and etc logic manually. The more there are entities in your app, the more duplicated code you will do, the more complex your application will be. So... We present you a `resource-store` library. 


## Concepts
**Resource** - an object-like entity, for example User, Project, File and etc. 

**Schema** - the object, which represent every field of entity (name, age, createdAt and etc.), computed fields (firstName + lastName = fullName, roleId = isAdmin and etc.) and relations (author->book, user->project and etc.).

**Store** - js class, which extends ResourceStore abstract class and implements: storage name, schema and helper methods (optional). 

**Store Name** - a unique name for the set of entities (resource-store), for example: "user", "project" and etc. It's used for relation logic.

## Setup
At first you need to create a store defenition. Example:

```typescript
// user.resource-store.ts
import { ResourceStore, Enums } from '@krix/resource-store';

interface User {
  id: number;
  firstName: string;
  age: number;
  isAuthor: boolean;
  createdAt: Date;
}
export class UserResourceStore extends ResourceStore<User> {
  public name = 'user';

  public schema: Interfaces.Schema<User> = {
    id: Enums.SchemaType.Number,
    firstName: Enums.SchemaType.String,
    age: Enums.SchemaType.Number,
    isAuthor: Enums.SchemaType.Boolean,
    createdAt: Enums.SchemaType.Date,
  };
}
```

Now, let's create an instance of the store and add first entities. Example:

```typescript
// example.ts
import { UserResourceStore } from './user.resource-store';

const userResourceStore = new UserResourceStore();

userResourceStore.inject({
  id: 1,
  firstName: 'Andrey',
  age: 26,
  isAuthor: true,
  createdAt: new Date('2021-05-20T22:11:26.892Z'),
});
userResourceStore.inject({
  id: 2,
  firstName: 'Artur',
  age: 24,
  isAuthor: true,
  createdAt: new Date('2021-05-22T14:47:12.762Z'),
});
```

We've stored 2 entities, now let's get one of them and remove second one.
```typescript
// example.ts
import { UserResourceStore } from './user.resource-store';

const userResourceStore = new UserResourceStore();

const userArture = userResourceStore.findOne({
  firstName: 'Artur',
});
console.log(userArture); // User with id = 2

userResourceStore.removeById(1);
console.log(userResourceStore.size); // 1

```

But that's not all. Injected and removed resource trigger `observation` signals. You can subscribe to these signals to get notifications about changes in `resource-store`. Library implements 3 observation signals:
1. Injected any resource;
2. Injected a specific resource (by "id");
3. Removed any resource.

Example:
```typescript
// example.ts
import { UserResourceStore } from './user.resource-store';

const userResourceStore = new UserResourceStore();

const anyUserResource$ = userResourceStore.getInjectObserver() // don't forget to unsubscribe
  .subscribe((user) => {
    console.log(`--- PT-1-[All-Injected]: User (${user.id}).`);
  });

const anyUserResource$ = userResourceStore.getInjectObserver(2) // don't forget to unsubscribe
  .subscribe((user) => {
    console.log(`--- PT-2-[Id-2-Injected]: User (2).`);
  });

const anyUserResource$ = userResourceStore.getRemoveObserver(2) // don't forget to unsubscribe
  .subscribe((user) => {
    console.log(`--- PT-3-[All-Removed]: User (${user.id}).`);
  });

userResourceStore.inject({
  id: 1,
  firstName: 'Andrey',
});
userResourceStore.inject({
  id: 2,
  firstName: 'Artur',
});
userResourceStore.inject({
  id: 3,
  firstName: 'Roma',
});
userResourceStore.removeById(1);
userResourceStore.removeById(2);
```
Output:

```
--- PT-1-[All-Injected]: User (1).
--- PT-1-[All-Injected]: User (2).
--- PT-2-[Id-2-Injected]: User (2).
--- PT-1-[All-Injected]: User (3).
--- PT-3-[All-Removed]: User (1).
--- PT-3-[All-Removed]: User (2).
```

## API

```typescript
findById (
  id: string|number,
): ResourceType;
```

Finds a resource in the store by the ID. If resource isn't found, method will return NULL.

___

```typescript
findOne (
  where: Interfaces.WhereConditions<ResourceType>,
): ResourceType;
```

Finds a resource in the store by the 'where' condition. If resource isn't found, method will return NULL.

___

```typescript
findAll (
  where?: Interfaces.WhereConditions<ResourceType>,
): ResourceType[];
```

Finds resources in the store by the 'where' condition. If resource isn't found, method will return an empty array.

___

```typescript
inject (
  resourceOrResources: ResourceType|ResourceType[],
): ResourceType|ResourceType[];
```

Injects the resource or resources to the store. If there is the resource with the same id, it will be replaced.

___

```typescript
removeById (
  id: string|number,
): ResourceType;
```

Removes a resource from the store by the id. Returns removed resource.

___

```typescript
remove (
  where?: Interfaces.WhereConditions<ResourceType>,
  emitRemoveSignal: boolean = true,
): ResourceType[];
```

Removes resources from the store and returns removed resources. If where condition is defined, method will remove only appropriate resources, otherwise method will remove all resources. If `emitRemoveSignal` flag is disabled, removed resources won't emit `Remove` signals.

___

```typescript
getInjectObserver (
  resourceId?: string | number,
): Observable<ResourceType>;
```

Returns RxJS observable which gets signals with an injected resources. If resource id is defined, method will get/create a Subject for this resource and create RxJS observable for it.

___

```typescript
getRemoveObserver (
  ): Observable<ResourceType>;
```

Returns RxJS observable which gets signals with removed resources.

## `where` condition

`where` condition supports predicates for 4 types: number, boolean, string, Date.

Number predicates:
```typescript
export interface NumberWhereConditions {
  /**
   * Resource's field stores any value from the passed array of numbers.
   */
  'in': number[];
  /**
   * Resource's field doesn't store values from the passed array of numbers.
   */
  '!in': number[];

  /**
   * Resource's field is equal to the passed number.
   */
  '===': number;
  /**
   * Resource's field isn't equal to the passed number.
   */
  '!==': number;
  /**
   * Resource's field is equal to the passed number or more than it.
   */
  '>=': number;
  /**
   * Resource's field is more than the passed number.
   */
  '>': number;
  /**
   * Resource's field is equal to the passed number or less than it.
   */
  '<=': number;
  /**
   * Resource's field is less than the passed number.
   */
  '<': number;

  /**
   * Resource's field is in the range from start up to end, but not including both ranges.
   */
  '()': [ number, number ];
  /**
   * Resource's field is in the range from start up to, but not including, end.
   */
  '[)': [ number, number ];
  /**
   * Resource's field is in the range from start but not including it, and up to end including it.
   */
  '(]': [ number, number ];
  /**
   * Resource's field is in the range from start up to end, including both ranges.
   */
  '[]': [ number, number ];
  /**
   * Resource's field isn't in the range from start up to end, but not including both ranges.
   */
  '!()': [ number, number ];
  /**
   * Resource's field isn't in the range from start up to, but not including, end.
   */
  '![)': [ number, number ];
  /**
   * Resource's field isn't in the range from start but not including it, and up to end including it.
   */
  '!(]': [ number, number ];
  /**
   * Resource's field isn't in the range from start up to end, including both ranges.
   */
  '![]': [ number, number ];
}
```

Boolean predicates:
```typescript
export interface BooleanWhereConditions {
  /**
   * Resource's field is equal to the passed value.
   */
  '===': boolean;
  /**
   * Resource's field isn't equal to the passed value.
   */
  '!==': boolean;
}
```

String predicates:
```typescript
export interface StringWhereConditions {
  /**
   * Resource's field stores any value from the passed array of strings.
   */
  'in': string[];
  /**
   * Resource's field doesn't store values from the passed array of strings.
   */
  '!in': string[];

  /**
   * Resource's field is equal to the passed string.
   */
  '===': string;
  /**
   * Resource's field isn't equal to the passed string.
   */
  '!==': string;

  /**
   * Resource's field looks like to the passed string|RegExp.
   */
  'like': string | RegExp;
  /**
   * Resource's field doesn't look like to the passed string|RegExp.
   */
  '!like': string | RegExp;
}
```

Date predicates:
```typescript
export interface DateWhereConditions {
  /**
   * Resource's field stores any value from the passed array of dates.
   */
  'in': Date[];
  /**
   * Resource's field doesn't store values from the passed array of dates.
   */
  '!in': Date[];

  /**
   * Resource's field is equal to the passed date.
   */
  '===': Date;
  /**
   * Resource's field isn't equal to the passed date.
   */
  '!==': Date;
  /**
   * Resource's field is equal to the passed date or more than it.
   */
  '>=': Date;
  /**
   * Resource's field is more than the passed date.
   */
  '>': Date;
  /**
   * Resource's field is equal to the passed date or less than it.
   */
  '<=': Date;
  /**
   * Resource's field is less than the passed date.
   */
  '<': Date;

  /**
   * Resource's field is in the range from start up to end, but not including both ranges.
   */
  '()': [ Date, Date ];
  /**
   * Resource's field is in the range from start up to, but not including, end.
   */
  '[)': [ Date, Date ];
  /**
   * Resource's field is in the range from start but not including it, and up to end including it.
   */
  '(]': [ Date, Date ];
  /**
   * Resource's field is in the range from start up to end, including both ranges.
   */
  '[]': [ Date, Date ];
  /**
   * Resource's field isn't in the range from start up to end, but not including both ranges.
   */
  '!()': [ Date, Date ];
  /**
   * Resource's field isn't in the range from start up to, but not including, end.
   */
  '![)': [ Date, Date ];
  /**
   * Resource's field isn't in the range from start but not including it, and up to end including it.
   */
  '!(]': [ Date, Date ];
  /**
   * Resource's field isn't in the range from start up to end, including both ranges.
   */
  '![]': [ Date, Date ];
}
```