import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import * as _ from './lodash';

import { WhereFilterHelper } from './where-filter.helper';
import { Enums } from './shared';
import {
  BaseResource,
  RelationBelongsToSchemaField,
  RelationHasSchemaField,
  Schema,
  SchemaField,
  SimpleSchemaField,
  WhereConditions,
} from './shared/interfaces';

export abstract class ResourceStore<ResourceType extends BaseResource> {
  /**
   * Store name.
   */
  public name(): string {
    throw new Error(`Name is required`);
  }
  /**
   * Store name.
   */
  public uniqKeys(): (keyof ResourceType)[] {
    return [`id`];
  }
  /**
   * Store name.
   */
  public readonly schema: Schema<ResourceType>;
  /**
   * Contains all registered resource stores for `relation` logic.
   * FYI: This structure is managed by external provider.
   */
  static relationMap: Map<string, ResourceStore<any>> = new Map();

  private store: ResourceType[];

  private sjInjectResourcesNotifMap: Map<string | number, Subject<ResourceType>>;
  /**
   * RxJS observables.
   */
  private sjInjectNotif: Subject<ResourceType>;
  private sjRemoveNotif: Subject<ResourceType>;

  private whereFilterHelper: WhereFilterHelper;

  constructor() {
    this.store = [];

    ResourceStore.relationMap.set(this.name(), this);
    this.sjInjectResourcesNotifMap = new Map();

    this.sjInjectNotif = new Subject();
    this.sjRemoveNotif = new Subject();

    this.whereFilterHelper = new WhereFilterHelper();
  }

  /**
   * Size of the resource store.
   */
  get size(): number {
    return this.store.length;
  }

  /**
   * Returns RxJS observable which gets signals with an injected resources. If resource id is defined, method
   * will get/create a Subject for this resource and create RxJS observable for it.
   */
  getInjectObserver(resource?: Partial<ResourceType>): Observable<ResourceType> {
    if (_.isNil(resource)) {
      return this.sjInjectNotif.asObservable();
    }

    const searchKey = this.buildSearchKey(resource);
    let sjInjectResourceNotif = this.sjInjectResourcesNotifMap.get(searchKey);
    if (_.isNil(sjInjectResourceNotif)) {
      sjInjectResourceNotif = new Subject();
      this.sjInjectResourcesNotifMap.set(searchKey, sjInjectResourceNotif);
    }

    return sjInjectResourceNotif.asObservable();
  }

  /**
   * Returns RxJS observable which gets signals with removed resources.
   */
  getRemoveObserver(): Observable<ResourceType> {
    return this.sjRemoveNotif.asObservable();
  }

  /**
   * Injects the resource or resources to the store. If there is the resource with the same
   * id, it will be replaced.
   */
  inject(resourceOrResources: ResourceType): ResourceType;
  inject(resourceOrResources: ResourceType[]): ResourceType[];
  inject(resourceOrResources: ResourceType | ResourceType[]): ResourceType | ResourceType[] {
    if (!Array.isArray(resourceOrResources)) {
      const injectedResource = this.injectOne(resourceOrResources);
      return injectedResource;
    }

    const injectedResources = (resourceOrResources ?? []).map((resource) => {
      const injectedResource = this.injectOne(resource);
      return injectedResource;
    });
    return injectedResources;
  }

  /**
   * Returns `true` if resource has uniq keys.
   */
  private hasUniqKeys(resource: ResourceType): boolean {
    return _.every(this.uniqKeys(), (uniqKey) => {
      return _.has(resource, uniqKey);
    });
  }

  /**
   * Return `true` if value has valid uniq key type.
   */
  private isValidUniqKeyType(value: any): boolean {
    const idType = typeof value;
    return idType === 'string' || idType === 'number';
  }

  /**
   * Returns `true` if resource has valid uniq keys.
   */
  private hasValidUniqKeys(resource: ResourceType): boolean {
    return _.every(this.uniqKeys(), (uniqKey) => {
      return this.isValidUniqKeyType(resource[uniqKey]);
    });
  }

  /**
   * Creates the object from uniq keys to find uniq resource.
   */
  private buildSearchObject(resource: ResourceType) {
    const searchObj = {} as ResourceType;
    for (const uniqKey of this.uniqKeys()) {
      searchObj[uniqKey] = resource[uniqKey];
    }

    return searchObj;
  }

  /**
   * Creates the object from uniq keys to find uniq resource.
   */
  private buildSearchKey(resource: Partial<ResourceType>): string {
    let searchKey = ``;
    for (const uniqKey of this.uniqKeys()) {
      searchKey += `${resource[uniqKey]};`;
    }

    return searchKey;
  }

  /**
   * Sets the resource to store. If there is the resource with the same id, it will be replaced.
   */
  private injectOne(resource: ResourceType): ResourceType {
    if (!this.hasUniqKeys(resource)) {
      throw new Error(`ResourceStore.injectOne: Resource must have uniq key (${this.uniqKeys().join(', ')}).`);
    }

    if (!this.hasValidUniqKeys(resource)) {
      throw new Error(`ResourceStore.injectOne: Uniq key (${this.uniqKeys().join(', ')}) must be a string or number.`);
    }

    const oldResourceIndex = _.findIndex(this.store, this.buildSearchObject(resource));

    const transformedResource = this.transformObjectBySchema(resource);

    if (oldResourceIndex === -1) {
      this.store.push(transformedResource);
    } else {
      this.store.splice(oldResourceIndex, 1, transformedResource);
    }

    this.sjInjectNotif.next(transformedResource);

    const searchKey = this.buildSearchKey(resource);
    const sjInjectResourceNotif = this.sjInjectResourcesNotifMap.get(searchKey);
    if (!_.isNil(sjInjectResourceNotif)) {
      sjInjectResourceNotif.next(transformedResource);
    }

    return transformedResource;
  }

  /**
   * Removes a resource from the store by the id. Returns removed resource.
   */
  removeById(id: string | number): ResourceType {
    const idType = typeof id;
    if (idType !== 'string' && idType !== 'number') {
      throw new Error(`ResourceStore.removeById: "id" must be a string or number.`);
    }

    const resourceIndex = _.findIndex(this.store, ['id', id]);

    if (resourceIndex === -1) {
      return null;
    }

    const resource = this.store[resourceIndex];
    this.store.splice(resourceIndex, 1);
    this.removeInjectNotificationSubject(resource.id);

    this.sjRemoveNotif.next(resource);
    return resource;
  }

  /**
   * Removes resources from the store and returns removed resources. If where condition is defined,
   * method will remove only appropriate resources, otherwise method will remove all resources.
   */
  remove(where?: WhereConditions<ResourceType>, emitRemoveSignal: boolean = true): ResourceType[] {
    if (_.isEmpty(this.store)) {
      return [];
    }

    let removedResources: ResourceType[] = [];
    const restResources: ResourceType[] = [];
    if (_.isNil(where)) {
      removedResources = this.store;
    } else {
      _.map(this.store, (resource) => {
        const resourceIsRemoved = this.whereFilterHelper.filterByCondition(this.schema, resource, where);
        if (!resourceIsRemoved) {
          restResources.push(resource);
        } else {
          removedResources.push(resource);
          this.removeInjectNotificationSubject(resource.id);
        }
      });
    }

    this.store = restResources;

    if (emitRemoveSignal) {
      _.map(removedResources, (resource) => {
        this.sjRemoveNotif.next(resource);
      });
    }
    return removedResources;
  }

  /**
   * Removes all entries from store.
   */
  clear(): void {
    this.remove();
  }

  /**
   * Removes `inject` notification subject from the internal map.
   */
  private removeInjectNotificationSubject(resourceId: string | number) {
    const sjInjectResourceNotif = this.sjInjectResourcesNotifMap.get(resourceId);
    if (_.isNil(sjInjectResourceNotif)) {
      return;
    }

    sjInjectResourceNotif.complete();
    this.sjInjectResourcesNotifMap.delete(resourceId);
  }

  /**
   * Finds a resource in the store by the ID. If resource isn't found, method will return NULL.
   */
  findById(id: string | number): ResourceType {
    if (_.isNil(id)) {
      return null;
    }

    const resource = _.find(this.store, ['id', id]);
    if (_.isNil(resource)) {
      return null;
    }

    return resource;
  }

  /**
   * Finds a resource in the store by the 'where' condition. If resource isn't found, method will
   * return NULL.
   */
  findOne(where: WhereConditions<ResourceType>): ResourceType {
    const foundResource = _.find(this.store, (resource) => {
      return this.whereFilterHelper.filterByCondition(this.schema, resource, where);
    });
    if (_.isNil(foundResource)) {
      return null;
    }

    return foundResource;
  }

  /**
   * Finds resources in the store by the 'where' condition. If resource isn't found, method will
   * return an empty array.
   */
  findAll(where?: WhereConditions<ResourceType>): ResourceType[] {
    const foundResources = _.isNil(where)
      ? [...this.store]
      : _.filter(this.store, (resource) => {
          return this.whereFilterHelper.filterByCondition(this.schema, resource, where);
        });
    if (_.isNil(foundResources)) {
      return null;
    }

    return foundResources;
  }

  /**
   * Transforms the external object into schema-like object.
   */
  private transformObjectBySchema(resource: ResourceType): ResourceType {
    const resourceBySchema: any = {};
    /* eslint-disable guard-for-in */
    for (const fieldName in this.schema) {
      const schemaField: SchemaField<ResourceType> = this.schema[fieldName];

      if (typeof schemaField !== 'object') {
        const fieldValue = resource[fieldName];
        const transformedFieldValue = this.transformValueToSimpleField(schemaField, fieldValue);
        resourceBySchema[fieldName] = transformedFieldValue;
        continue;
      }

      if (schemaField.type !== Enums.SchemaType.Computed && schemaField.type !== Enums.SchemaType.Relation) {
        const fieldValue = resource[fieldName];
        const transformedFieldValue = this.transformValueToSimpleField(schemaField.type, fieldValue);
        resourceBySchema[fieldName] = transformedFieldValue;
        continue;
      }

      if (schemaField.type === Enums.SchemaType.Computed) {
        Object.defineProperty(resourceBySchema, fieldName, {
          configurable: false,
          enumerable: false,
          get: () => {
            const computedValue = schemaField.compute(resourceBySchema as ResourceType);
            return computedValue;
          },
        });
        continue;
      }

      if (schemaField.type === Enums.SchemaType.Relation) {
        Object.defineProperty(resourceBySchema, fieldName, {
          configurable: false,
          enumerable: false,
          get: () => {
            const relatedValue = this.getRelatedValue(resourceBySchema as ResourceType, schemaField);
            return relatedValue;
          },
        });
        continue;
      }
    }

    return resourceBySchema;
  }

  /**
   * Transforms the field value into simple field.
   */
  private transformValueToSimpleField(
    schemaField: SimpleSchemaField,
    fieldValue: any,
  ): number | string | boolean | Date | null | undefined {
    if (_.isNil(fieldValue)) {
      return fieldValue;
    }

    if (schemaField === Enums.SchemaType.Number) {
      return Number(fieldValue);
    }

    if (schemaField === Enums.SchemaType.String) {
      return String(fieldValue);
    }

    if (schemaField === Enums.SchemaType.Boolean) {
      return Boolean(fieldValue);
    }

    if (schemaField === Enums.SchemaType.Date) {
      return new Date(fieldValue as Date);
    }

    if (schemaField === Enums.SchemaType.Object) {
      return fieldValue;
    }

    throw new Error(`SchemaService.transformBaseField: Unknown schema type: ${JSON.stringify(schemaField)}`);
  }

  /**
   * Finds and returns a value/values of the include field.
   */
  private getRelatedValue<TargetResourceType = any>(
    sourceResource: ResourceType,
    includeField: RelationBelongsToSchemaField<ResourceType> | RelationHasSchemaField,
  ): TargetResourceType | TargetResourceType[] {
    const resourceStore = ResourceStore.relationMap.get(includeField.resource);

    if (_.isNil(resourceStore)) {
      throw new Error(
        `ResourceStore.getIncludeValue: ` +
          `We can't find the resource store (${includeField.resource}) in relation map.`,
      );
    }

    switch (includeField.relation) {
      case Enums.RelationType.BelongsToOne: {
        const includeResourceId: string = sourceResource[includeField.sourceProperty];
        if (_.isNil(includeResourceId)) {
          return null;
        }

        const includeResource = resourceStore.findById(includeResourceId);
        return includeResource;
      }
      case Enums.RelationType.BelongsToMany: {
        const includeResourceIds: string[] = sourceResource[includeField.sourceProperty];
        if (!Array.isArray(includeResourceIds) || _.isEmpty(includeResourceIds)) {
          return [];
        }

        const includeResources = resourceStore.findAll({
          id: {
            in: includeResourceIds,
          },
        });
        return includeResources;
      }
      case Enums.RelationType.HasOne: {
        const sourceResourceId = sourceResource.id;
        const includeResource = resourceStore.findOne({
          [includeField.targetProperty]: sourceResourceId,
        });
        return includeResource;
      }
      case Enums.RelationType.HasMany: {
        const sourceResourceId = sourceResource.id;
        const includeResources = resourceStore.findAll({
          [includeField.targetProperty]: sourceResourceId,
        });
        return includeResources;
      }
    }
  }
}
