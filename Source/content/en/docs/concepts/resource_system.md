---
title: Resource System
description: How to get access to storage
weight: 90
---

When using the [Dolittle SDK](https://github.com/dolittle/dotnet.sdk) you get access to the Resource System which is a way to get access to storage. The Resources you get will be separated by [Tenants]({{<ref tenants>}}) and unique in your current context. This means that you can depend on the stored data not leaking between tenants.

## Read Cache

The Read Cache is available from the Resource System as an `IMongoDatabase` that you can reference in your code. The database will be connected, and you can use normal MongoDB queries to get access to the data you store there.

### Example

A minimal example of an AspNet Core web application that uses the Dolittle SDK and the Read Cache could look like this:

```csharp
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using MongoDB.Driver;
using ResourceSystemDemo;

var builder = WebApplication.CreateBuilder(args);

// Add Dolittle to the web-application's host.
builder.Host.UseDolittle();

var app = builder.Build();

await app.StartAsync();

// get a client
var dolittleClient = await app.GetDolittleClient();

// get a reference the the development-tenant's read-cache
var tenantedReadCache = dolittleClient
    .Resources
    .ForTenant(TenantId.Development)
    .MongoDB
    .GetDatabase();

var id = Guid.NewGuid().ToString();

// the ReadModel has only Id and Value in this example
var readModel = new ReadModel(id, "this is my data");

// in this example the collection-name is "models"
const string collectionName = "models";
tenantedReadCache
    .GetCollection<ReadModel>(collectionName)
    .InsertOne(readModel);

// get the inserted read-model back from storage
var retrievedFromStorage = tenantedReadCache
    .GetCollection<ReadModel>(collectionName)
    .AsQueryable()
    .Where(rm => rm.Id == id)
    .Single();

Console.WriteLine(
    $"retrieved read-model was {retrievedFromStorage}"
);

// to keep running: await app.WaitForShutdownAsync();
await app.StopAsync();
```

In your actual code you would need to decide the collection-name and build your ReadModels to match your needs.

Note that the interactions with the `tenantedReadCache` are all done using a normal MongoDB driver. This means that you can use the full power of MongoDB to query and update your data.

## Accessing the Event Store directly

The Event Store is available from the Dolittle SDK directly. The backing data-storage is [MongoDB](https://www.mongodb.com/), but no MongoDB driver access is available from the SDK. To interact with the [Event Store]({{<ref event_store>}}) there are methods available to

- commit events
- commit public events
- get all the events for an aggregate-root
- get all the events in a stream for an aggregate-root

### Committing events and public events

With a Dolittle Client from the Dolittle SDK you can commit events to the Event Store directly (skipping any [aggregates]({{<ref aggregates>}})).

```csharp
// assume we have the app like above
var dolittleClient = await app.GetDolittleClient();

var tenantedEventStore = dolittleClient
    .EventStore
    .ForTenant(TenantId.Development);

// assume we have an Event -type called SomeEvent with Id and Value
var someEvent = new SomeEvent(
    Id: Guid.NewGuid().ToString(),
    Value: "this is my data");

tenantedEventStore
    .CommitEvent(
        content: someEvent,
        eventSourceId: "Demo"
    );

// assume we have another Event -type called SomePublicEvent
var somePublicEvent = new SomePublicEvent(
    Id: Guid.NewGuid().ToString(),
    Value: "this is data going on the public stream");

tenantedEventStore
    .CommitPublicEvent(
        content: somePublicEvent,
        eventSourceId: "Demo"
    );
```

### Getting events for an aggregate-root

It is only possible to get events from the Event Store if they are associated with an [aggregate-root]({{<ref aggregates>}}). This means that you need to know the aggregate-root's ID and the event-source id to get the events. Remember that the aggregate-root ID identifies the type of aggregate-root and event-source ID identifies the instance of that aggregate-root-type.

You can either get all the events as a collection, or you can get it as a streaming [`IAsyncEnumerable`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#await-foreach).

We have a minimal aggregate-root type called `Lookout` with an aggregate-root id:
```csharp
[AggregateRoot("B92DE697-2E09-4AE1-99A2-3BB72925B0AF")]
public class Lookout : AggregateRoot
{
    public void SeeSomething() => Apply(new SomeEvent(
        Id: Guid.NewGuid().ToString(),
        Value: "something happened"));
}
```

We call on the lookout with the id "Alice" to see something through the Dolittle Client:

```csharp
await dolittleClient
    .Aggregates
    .ForTenant(TenantId.Development)
    .Get<Lookout>("Alice")
    .Perform(
        alice => alice.SeeSomething()
    );
```

We can now access the events from an instance of that aggregate-root type like this:

```csharp
var events = await dolittleClient
    .EventStore
    .ForTenant(TenantId.Development)
    .FetchForAggregate("B92DE697-2E09-4AE1-99A2-3BB72925B0AF", "Alice");

Console.WriteLine($"Alice has seen something {events.Count} times");
```

If we want to get the events as a streaming `IAsyncEnumerable` (there may be many events) we can do it like this:

```csharp
var stream = dolittleClient
    .EventStore
    .FetchStreamForAggregate(
        "B92DE697-2E09-4AE1-99A2-3BB72925B0AF",
        "Alice");

await foreach (var chunk in stream)
{
    Console.WriteLine("streaming to: " + chunk.AggregateRootVersion);
    foreach(var evt in chunk)
    {
        Console.WriteLine("evt: " + evt.Content);
    }
}
```

## Summary

The Resource System is a way to get access to storage in your Dolittle application. The Read Cache is a way to get access to a MongoDB database that is unique to your tenant. The Event Store is a way to get access to the events that have been committed to the Event Store by Aggregate-Roots for your tenant.
