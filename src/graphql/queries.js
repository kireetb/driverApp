/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      car {
        id
        type
        latitude
        longitude
        heading
        isActive
        userId
        createdAt
        updatedAt
        owner
        __typename
      }
      orders {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        username
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCar = /* GraphQL */ `
  query GetCar($id: ID!) {
    getCar(id: $id) {
      id
      type
      latitude
      longitude
      heading
      isActive
      userId
      user {
        id
        username
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;

export const getCarId = /* GraphQL */ `
  query GetCar($id: ID!) {
    getCar(id: $id) {
      id
    }
  }
`;


export const listCars = /* GraphQL */ `
  query ListCars(
    $filter: ModelCarFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCars(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        latitude
        longitude
        heading
        isActive
        userId
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getOrder = /* GraphQL */ `
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      id
      type
      status
      createdAt
      originLatitude
      originLongitude
      destLatitude
      destLongitude
      userId
      user {
        id
        username
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      carId
      car {
        id
        type
        latitude
        longitude
        heading
        isActive
        userId
        createdAt
        updatedAt
        owner
        __typename
      }
      updatedAt
      __typename
    }
  }
`;
export const listOrders = /* GraphQL */ `
  query ListOrders(
    $filter: ModelOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        status
        createdAt
        originLatitude
        originLongitude
        destLatitude
        destLongitude
        userId
        carId
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ordersByUserIdAndCreatedAt = /* GraphQL */ `
  query OrdersByUserIdAndCreatedAt(
    $userId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ordersByUserIdAndCreatedAt(
      userId: $userId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        type
        status
        createdAt
        originLatitude
        originLongitude
        destLatitude
        destLongitude
        userId
        carId
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;