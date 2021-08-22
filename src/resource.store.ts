import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';

import type { Interfaces } from './shared';

import { WhereFilterHelper } from './where-filter.helper';
import { Enums, Helper } from './shared';

export abstract class ResourceStore <ResourceType extends Interfaces.BaseResource> {
  /**
   * Store name.
   */
  public abstract readonly name: string;
  /**
   * Store name.
   */
  public abstract readonly schema: Interfaces.Schema<ResourceType>;
  /**
   * Contains all registered resource stores for `relation` logic.
   * FYI: This structure is managed by external provider.
   */
  public relationMap: Map<string, ResourceStore<any>>;

  private store: ResourceType[];

  /**
   * RxJS observables.
   */
  private sjInjectNotif: Subject<ResourceType>;
  private sjRemoveNotif: Subject<ResourceType>;

  private whereFilterHelper: WhereFilterHelper;

  constructor (
  ) {
    this.store = [];

    this.sjInjectNotif = new Subject();
    this.sjRemoveNotif = new Subject();

    this.whereFilterHelper = new WhereFilterHelper();
  }

  /**
   * Returns RxJS observable which gets signals with an injected resources.
   *
   * @return {Observable<ResourceType>}
   */
  getInjectObserver (
  ): Observable<ResourceType> {
    return this.sjInjectNotif.asObservable();
  }

  /**
   * Returns RxJS observable which gets signals with removed resources.
   *
   * @return {Observable<ResourceType>}
   */
  getRemoveObserver (
  ): Observable<ResourceType> {
    return this.sjRemoveNotif.asObservable();
  }

  /**
   * Injects the resource or resources to the storage. If there is the resource with the same
   * id, it will be replaced.
   *
   * @param  {ResourceType} resource
   * @return {void}
   */
  inject <ResourceOrResources extends ResourceType | ResourceType[]> (
    resourceOrResources: ResourceOrResources,
  ): ResourceOrResources extends ResourceType ? ResourceType : ResourceType[];
  inject (
    resourceOrResources: ResourceType|ResourceType[],
  ): ResourceType|ResourceType[] {
    if (Helper.isArray(resourceOrResources) === false) {
      const injectedResource = this.injectOne(resourceOrResources as ResourceType);
      return injectedResource;
    }

    const injectedResources = (resourceOrResources as ResourceType[] ?? []).map((resource) => {
      const injectedResource = this.injectOne(resource);
      return injectedResource;
    });
    return injectedResources;
  }

  /**
   * Sets the resource to storage. If there is the resource with the same id, it will be replaced.
   *
   * @param  {ResourceType} resource
   * @return {ResourceType}
   */
  private injectOne (
    resource: ResourceType,
  ): ResourceType {
    if (Helper.has(resource, 'id') === false) {
      throw new Error(`ResourceStore.injectOne: Resource must have ID property.`);
    }
    const idType = typeof resource.id;
    if (idType !== 'string' && idType !== 'number') {
      throw new Error(`ResourceStore.injectOne: "id" must be a string or number.`);
    }

    const oldResourceIndex = Helper.findIndex(this.store, [ 'id', resource.id ]);

    const transformedResource = this.transformObjectBySchema(resource);

    if (oldResourceIndex === -1) {
      this.store.push(transformedResource);
    } else {
      this.store.splice(oldResourceIndex, 1, transformedResource);
    }

    this.sjInjectNotif.next(transformedResource);
    return transformedResource;
  }

  /**
   * Removes a resource from the store by the id. Returns removed resource.
   *
   * @param  {string|number} id
   * @return {ResourceType}
   */
  removeById (
    id: string|number,
  ): ResourceType {
    const idType = typeof id;
    if (idType !== 'string' && idType !== 'number') {
      throw new Error(`ResourceStore.removeById: "id" must be a string or number.`);
    }

    const resourceIndex = Helper.findIndex(this.store, [ 'id', id ]);

    if (resourceIndex === -1) {
      return null;
    }

    const resource = this.store[resourceIndex];
    this.store.splice(resourceIndex, 1);

    this.sjRemoveNotif.next(resource);
    return resource;
  }

  /**
   * Removes resources from the store and returns removed resources. If where condition is defined,
   * method will remove only appropriate resources, otherwise method will remove all resources.
   *
   * @param  {Interfaces.WhereConditions<ResourceType>} [where]
   * @param  {boolean} [emitRemoveSignal=false]
   * @return {ResourceType[]}
   */
  remove (
    where?: Interfaces.WhereConditions<ResourceType>,
    emitRemoveSignal: boolean = false,
  ): ResourceType[] {
    if (Helper.isEmpty(this.store) === true) {
      return [];
    }

    let removedResources: ResourceType[] = [];
    const restResources: ResourceType[] = [];
    if (Helper.isNil(where) === true) {
      removedResources = this.store;
    } else {
      Helper.map(this.store, (resource) => {
        const resourceIsRemoved = this.whereFilterHelper.filterByCondition(this.schema, resource, where);
        if (resourceIsRemoved === false) {
          restResources.push(resource);
        } else {
          removedResources.push(resource);
        }
      });
    }

    this.store = restResources;

    if (emitRemoveSignal === true) {
      Helper.map(removedResources, (resource) => {
        this.sjRemoveNotif.next(resource);
      });
    }
    return removedResources;
  }

  /**
   * Finds a resource in the store by the ID. If resource isn't found, method will return NULL.
   *
   * @param  {string|number} id
   * @return {ResourceType}
   */
  findById (
    id: string|number,
  ): ResourceType {
    if (Helper.isNil(id) === true) {
      return null;
    }

    const resource = Helper.find(this.store, [ 'id', id ]);
    if (Helper.isNil(resource) === true) {
      return null;
    }

    return resource;
  }

  /**
   * Finds a resource in the store by the 'where' condition. If resource isn't found, method will
   * return NULL.
   *
   * @param  {Partial<ResourceType>} where
   * @param  {Interfaces.FindOptions} [options]
   * @return {ResourceType}
   */
  findOne (
    where: Interfaces.WhereConditions<ResourceType>,
    options?: Interfaces.FindOptions,
  ): ResourceType {
    const foundResource = Helper.find(this.store, (resource) => {
      return this.whereFilterHelper.filterByCondition(this.schema, resource, where);
    });
    if (Helper.isNil(foundResource) === true) {
      return null;
    }

    return foundResource;
  }

  /**
   * Finds a resource in the store by the 'where' condition. If resource isn't found, method will
   * return NULL.
   *
   * @param  {Partial<ResourceType>} where
   * @param  {Interfaces.FindOptions} [options]
   * @return {ResourceType}
   */
  findAll (
    where?: Interfaces.WhereConditions<ResourceType>,
    options?: Interfaces.FindOptions,
  ): ResourceType[] {
    const foundResources = Helper.isNil(where) === true
      ? [ ...this.store ]
      : Helper.filter(this.store, (resource) => {
        return this.whereFilterHelper.filterByCondition(this.schema, resource, where);
      });
    if (Helper.isNil(foundResources) === true) {
      return null;
    }

    return foundResources;
  }

  /**
   * Transforms the external object into schema-like object.
   *
   * @param  {ResourceType} resource
   */
  private transformObjectBySchema (
    resource: ResourceType,
  ): ResourceType {
    const resourceBySchema: any = {};
    /* eslint-disable guard-for-in */
    for (const fieldName in this.schema) {
      const schemaField: Interfaces.SchemaField<ResourceType> = this.schema[fieldName];

      if (typeof schemaField !== 'object') {
        const fieldValue = resource[fieldName];
        const transformedFieldValue = this.transofrmValueToSimpleField(schemaField, fieldValue);
        resourceBySchema[fieldName] = transformedFieldValue;
        continue;
      }

      if (schemaField.type !== Enums.SchemaType.Computed && schemaField.type !== Enums.SchemaType.Relation) {
        const fieldValue = resource[fieldName];
        const transformedFieldValue = this.transofrmValueToSimpleField(schemaField.type, fieldValue);
        resourceBySchema[fieldName] = transformedFieldValue;
        continue;
      }

      if (schemaField.type === Enums.SchemaType.Computed) {
        Object.defineProperty(resourceBySchema, fieldName, {
          configurable: false,
          enumerable: false,
          get: () => {
            const computedValue = schemaField.compute(resourceBySchema);
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
            const relatedValue = this.getRelatedValue(resourceBySchema, schemaField);
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
   *
   * @param  {Interfaces.SimpleSchemaField} schemaField
   * @param  {} fieldValue
   */
  private transofrmValueToSimpleField (
    schemaField: Interfaces.SimpleSchemaField,
    fieldValue: any,
  ): number|string|boolean|Date|null|undefined {
    if (Helper.isNil(fieldValue) === true) {
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
      return new Date(fieldValue);
    }

    if (schemaField === Enums.SchemaType.Object) {
      return fieldValue;
    }

    throw new Error(`SchemaService.transofrmBaseField: Unknown schema type: ${JSON.stringify(schemaField)}`);
  }

  /**
   * Finds and returns a value/values of the include field.
   *
   * @param  {ResourceType} sourceResource
   * @param  {Interfaces.IncludeField} includeField
   * @return {TargetResourceType|TargetResourceType[]}
   */
  private getRelatedValue <TargetResourceType = any> (
    sourceResource: ResourceType,
    includeField: Interfaces.RelationBelongsToSchemaField<ResourceType> | Interfaces.RelationHasSchemaField,
  ): TargetResourceType|TargetResourceType[] {
    if (Helper.isNil(this.relationMap) === true) {
      throw new Error(`ResourceStore.getIncludeValue: `
        + `We can't find a map with resource stores in the resource store (${this.name}).`);
    }

    const resourceStore = this.relationMap.get(includeField.resource);

    if (Helper.isNil(resourceStore) === true) {
      throw new Error(`ResourceStore.getIncludeValue: `
        + `We can't find the resource store (${includeField.resource}) in relation map.`);
    }

    switch (includeField.relation) {
      case Enums.RelationType.BelongsToOne: {
        const includeResourceId: string = sourceResource[includeField.sourceProperty];
        if (Helper.isNil(includeResourceId) === true) {
          return null;
        }

        const includeResource = resourceStore.findById(includeResourceId);
        return includeResource;
      }
      case Enums.RelationType.BelongsToMany: {
        const includeResourceIds: string[] = sourceResource[includeField.sourceProperty];
        if (Helper.isArray(includeResourceIds) === false || Helper.isEmpty(includeResourceIds)) {
          return [];
        }

        const includeResources = resourceStore.findAll({
          id: {
            'in': includeResourceIds,
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
