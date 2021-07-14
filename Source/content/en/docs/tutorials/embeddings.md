---
title: Embeddings
description: Get started with Embeddings
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel
weight: 17
---

Welcome to the tutorial for Embeddings in Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that event sources data coming from an external system. This external system is keeping track of the chefs in the kitchen, like a HR system. We're going to be "freeing" this data by event sourcing with the help of [Embeddings]({{< ref "docs/concepts/embeddings" >}}), so that other parts of the code can utilize it more freely.

Embeddings are like a combination of an [Aggregate]({{< ref "aggregates" >}}) and a [Projection]({{< ref "projections" >}}). They have a collection of states (the read models) with unique keys (within the embedding). Whenever a new updated state is pushed/pulled from the external system, that updated state will be compared against its representative read model in the embedding. Whenever the states differ, the Runtime will call the embedding to resolve the difference into events. The embedding will then handle these events and modify its state to match the desired state.

The main point of embeddings is event source the changes coming from an external system. An embeddings read model exists so that we can commit the correct events and uphold its logic. Other [event handlers]({{< ref "docs/concepts/event_handlers_and_filters" >}}), [projections]({{< ref "docs/concepts/projections" >}}) and [microservices]({{< ref "event-horizon" >}}) can then build upon these events.

Example of a embedding:

![Diagram of embeddings](/images/concepts/embeddings.png)

After this tutorial you will have:

* a running Dolittle environment with a [Runtime]({{< ref "docs/concepts/overview" >}}) and a MongoDB, and
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits [Events]({{< ref "docs/concepts/events" >}})
* an [Embedding]({{< ref "docs/concepts/embeddings" >}}) which creates events based on changes in the HR system.

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Tutorials/Embeddings) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Tutorials/Embeddings).

## Setup
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

{{< tabs name="setup_tab" >}}
{{% tab name="C#" %}}

Prerequisites:
* [.NET Core SDK](https://dotnet.microsoft.com/download)
* [Docker](https://www.docker.com/products/docker-desktop)

Before getting started, your directory should look something like this:

    └── Kitchen/
        ├── Program.cs
        └── Kitchen.csproj

{{% /tab %}}

{{% tab name="TypeScript" %}}

Prerequisites:
* [Node.js >= 12](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/products/docker-desktop)

Before getting started, your directory should look something like this:

    └── kitchen/
        ├── .eslintrc
        ├── index.ts
        ├── package.json
        └── tsconfig.json

{{% /tab %}}
{{< /tabs >}}

### Start the Dolittle environment
Start the Dolittle environment with all the necessary dependencies (if you didn't have it running already) with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the embeddings, while the MongoDB is used for persistence.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

## Create the events

In this example, we want to [event source]({{< ref "docs/concepts/event_sourcing" >}}) the data coming from a mocked HR system.  We want to keep track of hired employees, their workplace and whenever they retire. Let's create 3 different [EventTypes]({{< ref "docs/concepts/events#eventtype" >}}) to signal whenever an employee is hired, transferred or retires:


{{< tabs name="events_tab" >}}
{{% tab name="C#" %}}
**EmployeeHired**:

```csharp
// EmployeeHired.cs
using Dolittle.SDK.Events;

namespace Kitchen
{
    [EventType("8fdf45bc-f484-4348-bcb0-4d6f134aaf6c")]
    public class EmployeeHired
    {
        public string Name { get; set; }

        public EmployeeHired(string name) => Name = name;
    }
}
```

**EmployeeTransferred**:

```csharp
// EmployeeTransferred.cs
using Dolittle.SDK.Events;

namespace Kitchen
{
    [EventType("b27f2a39-a2d4-43a7-9952-62e39cbc7ebc")]
    public class EmployeeTransferred
    {
        public string Name { get; set; }
        public string From { get; set; }
        public string To { get; set; }

        public EmployeeTransferred(string name, string from, string to)
        {
            Name = name;
            From = from;
            To = to;
        }
    }
}
```

**EmployeeRetired**:
```csharp
// EmployeeRetired.cs
using Dolittle.SDK.Events;

namespace Kitchen
{
    [EventType("1932beb4-c8cd-4fee-9a7e-a92af3693510")]
    public class EmployeeRetired
    {
        public string Name { get; set; }

        public EmployeeRetired(string name) => Name = name;
    }
}
```

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
```
{{% /tab %}}
{{< /tabs >}}


## Create an `Employee` Embedding

In this example, we want to events source the data coming from a mocked HR system by using [Embeddings]({{< ref "docs/concepts/embeddings" >}}). Let's create an [Embedding]({{< ref "docs/concepts/embeddings" >}}) that keeps track of the changes coming from the HR system by committing and handling of the events we made earlier:

{{< tabs name="employee_tab" >}}
{{% tab name="C#" %}}
```csharp
// Employee.cs
using Dolittle.SDK.Projections;

namespace Kitchen
{
    [Embedding("e5577d2c-0de7-481c-b5be-6ef613c2fcd6")]
    public class Employee
    {
        public string Name { get; set; } = "";
        public string Workplace { get; set; } = "Unassigned";

        public object ResolveUpdateToEvents(Employee updatedEmployee, EmbeddingContext context)
        {
            if (Name != updatedEmployee.Name)
            {
                return new EmployeeHired(updatedEmployee.Name);
            }
            else if (Workplace != updatedEmployee.Workplace)
            {
                return new EmployeeTransferred(Name, updatedEmployee.Workplace);
            }

            throw new NotImplementedException();
        }

        public object ResolveDeletionToEvents(EmbeddingContext context)
        {
            return new EmployeeRetired(Name);
        }

        public void On(EmployeeHired @event, EmbeddingProjectContext context)
        {
            Name = @event.Name;
        }

        public void On(EmployeeTransferred @event, EmbeddingProjectContext context)
        {
            Workplace = @event.To;
        }

        public ProjectionResult<Employee> On(EmployeeRetired @event, EmbeddingProjectContext context)
        {
            return ProjectionResult<Employee>.Delete;
        }
    }
}
```

The `[Embedding()]` attribute identifies this embedding in the Runtime, and is used to keep track of the events that it creates and processes, it's state and the retrying the handling of an event if the handler fails (throws an exception).

`ResolveUpdateToEvents()` method will be called whenever the current state of the embeddings read model is different from the updated state. This method needs to return one or many events that will update the read model so that it moves "closer" to matching the desired state. The Runtime will then apply the returned events onto the embeddings `On()` methods. If the states still differ, it will call the `ResolveUpdateToEvents()` method again until the read models current state matches the updated state. At that point, the events will be committed to the [Event Log]({{< ref "docs/concepts/event_store#event-log" >}}). If the `On()` methods fail, or the Runtime detects that the embeddings state is looping, the process will be stopped and no events will be committed. This means that events will only be committed if they successfully result in the states matching.

The committed events are always [public]({{< ref "docs/concepts/events#public-vs-private" >}}) [Aggregate events]({{< ref "docs/concepts/aggregates#aggregateevents" >}}). The `AggregateRootId` is the same as the `EmbeddingId`, and the `EventSourceId` is computed from the read models key.

Unlike projections, you don't need to specify a [`KeySelector`]({{< ref "docs/concepts/projections#key-selector" >}}) for the `On()` methods. The Runtime will automatically calculate a unique [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}) for the committed events based on the embeddings [Key]({{< ref "docs/concepts/embeddings#key" >}}).

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
```
{{% /tab %}}
{{< /tabs >}}

{{< alert title="Committing embeddings events outside of embedding" color="warning" >}}
Only the embedding can commit the types of events that it handles, so that it's the only source of those particular event types. This is because the embedding is trying to event source the state of the external system, which is the real "source of truth". If the embedding would start receiving events coming from somewhere else it would be as another competing "source of truth" had appeared.

To enforce this, the embedding works like an [Aggregate]({{< ref "docs/concepts/aggregates" >}}) and keeps track of how many events it has handled and what is the events expected [`AggregateRootVersion`]({{< ref "docs/concepts/aggregates#version" >}}).
{{< /alert >}}

## Register the `Employee` embedding, and update and delete a read model
Let's register the new event types and the embedding. Then we can update and delete a read model from it.

{{< tabs name="client_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;

namespace Kitchen
{
    class Program
    {
        public static async Task Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                {
                    eventTypes.Register<EmployeeHired>();
                    eventTypes.Register<EmployeeTransferred>();
                    eventTypes.Register<EmployeeRetired>();
                })
                .WithEmbeddings(builder =>
                    builder.RegisterEmbedding<Employee>())
                .Build();
            _ = client.Start();

            // wait for the registration to complete
            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

            // mock of the state from the external HR system
            var updatedEmployee = new Employee
            {
                Name = "Mr. Taco",
                Workplace = "Street Food Taco Truck"
            };

            await client.Embeddings
                .ForTenant(TenantId.Development)
                .Update(updatedEmployee.Name, updatedEmployee);
            Console.WriteLine($"Updated {updatedEmployee.Name}.");

            await client.Embeddings
                .ForTenant(TenantId.Development)
                .Delete<Employee>(updatedEmployee.Name);
            Console.WriteLine($"Deleted {updatedEmployee.Name}.");

            // wait for the processing to finish before severing the connection
            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);
        }
    }
}
```
The `Update()` method tries to update the embeddings read model with the specified key to match the updated state by calling the embeddings `ResolveUpdateToEvents()` method. If no read model exists with the key, it will create one with the read model set to the embedding's initial state.

The `Delete()` method will call the embeddings `ResolveDeletionToEvents()` for the specified key. This method then return an event, which when handled will delete the read model.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
```
{{% /tab %}}
{{< /tabs >}}

## Run your microservice

Let's run the code! It should commit e events to the event log, one for hiring `"Mr. Taco"`, one for transferring him to `"Street Food Taco Truck"`, and one for Mr. Tacos retirement.

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Updated Mr. Taco.
Deleted Mr. Taco.
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
```
{{% /tab %}}
{{< /tabs >}}

### Check the events

Let's check the committed events from the event log:

{{< tabs name="mongodb_tab" >}}
{{% tab name="MongoDB" %}}
You can look at the events in the database through a database viewer (like [MongoDB Compass](https://www.mongodb.com/products/compass)) or by querying the database running in the `dolittle/runtime:latest-development` image through the [`mongo`](https://docs.mongodb.com/v4.2/mongo/) shell.

**MongoDB Compass**:

![MongoDB Compass with 2 events](/images/tutorials/embeddings_mongodb_compass_events.png)

**`mongo` shell**:

```console
$ docker exec <mongo-container> mongo event_store --quiet --eval 'db.getCollection("event-log").find({}, {Content: 1})'
{ "_id" : NumberDecimal("0"), "Content" : { "Name" : "Mr. Taco" } }
{ "_id" : NumberDecimal("1"), "Content" : { "Name" : "Mr. Taco", "From" : "Unassigned", "To" : "Street Food Taco Truck" } }
{ "_id" : NumberDecimal("2"), "Content" : { "Name" : "Mr. Taco" } }
```
{{% /tab %}}
{{< /tabs >}}

### Check the persisted embeddings

We can also check the state of the embeddings read models from the database. Embeddings are saved into a database defined in the [`resources.json`]({{< ref "docs/reference/runtime/configuration#resourcesjson" >}}) (defaults to `embeddings`), and each embedding gets it's unique collection named `embedding-<embedding-id>`. Deleted embeddings are "soft-deleted" with the `IsRemoved` property marking their deletion. If the read model is later updated, `IsRemoved` will be set to `false`.

{{< tabs name="mongodb_tab" >}}
{{% tab name="MongoDB" %}}

**MongoDB Compass**:

![MongoDB Compass showing mr taco read model](/images/tutorials/embeddings_mongodb_compass_read_models.png)

**`mongo` shell**:

```console
$ docker exec <mongo-container> mongo embeddings --quiet --eval 'db.getCollection("embedding-e5577d2c-0de7-481c-b5be-6ef613c2fcd6").find().pretty()'
{
	"_id" : "Mr. Taco",
	"Content" : "{\"Name\":\"Mr. Taco\",\"Workplace\":\"Street Food Taco Truck\"}",
	"IsRemoved" : true,
	"Version" : NumberLong(3)
}
```
{{% /tab %}}
{{< /tabs >}}


### Get the Embeddings

You can also get the read models and keys for an embedding. This can be useful when figuring out what states still exist in the external system compared to the embeddings read models or when debugging.

For example, the HR system might only return the currently hired employees. Any employees not returned by the HR system but still in the embedding could then be marked as retired.

{{< tabs name="get_tab" >}}
{{% tab name="C#" %}}
```csharp
/*
setup builder and update the read model first
*/
var mrTaco = client.Embeddings
    .ForTenant(TenantId.Development)
    .Get<Employee>("Mr. Taco");
var allEmployees = client.Embeddings
    .ForTenant(TenantId.Development)
    .GetAll<Employee>();
var employeeKeys = client.Embeddings
    .ForTenant(TenantId.Development)
    .GetKeys<Employee>();
```
{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
```
{{% /tab %}}
{{< /tabs >}}

If you try to get an embedding that doesn't exist, the Runtime will return you the initial state of the embedding.

{{% alert title="Viewing the read models" color="info" %}}
Do note, that the read models work like [Aggregates]({{< ref "docs/concepts/aggregates" >}}), they exist to uphold the rules of committing the correct events. They aren't meant to produce a view necessarily.
{{% /alert %}}


## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
