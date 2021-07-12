---
title: Embeddings
description: Get started with Embeddings
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel
weight: 17
---

Welcome to the tutorial for Embeddings in Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that event sources data coming from an external system. This external system is keeping track of the chefs in the kitchen, like a HR system. We're going to be "freeing" this data by event sourcing with the help of [Embeddings]({{< ref "docs/concepts/embeddings" >}}), so that other parts of the code can utilize it more freely.
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

## Create the events

In this example, we want to events source the data coming from a mocked HR system.  We want to keep track of hired employees, their workplace and their retirement. Let's create 3 different [EventTypes]({{< ref "docs/concepts/events#eventtype" >}}) to signal whenever a employee is hired, transferred or retired:


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

Embeddings are like a combination of an [Aggregate]({{< ref "aggregates" >}}) and a [Projection]({{< ref "projections" >}}).

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

The `[Embedding()]` attribute identifies this Embedding in the Runtime, and is used to keep track of the events that it creates and processes, it's state and the retrying the handling of an event if the handler fails (throws an exception).

`ResolveUpdateToEvents()` method will be called whenever the current state of the embeddings read model is different from the updated state. This method needs to return one or many events that will update the read model so that it moves "closer" to matching the desired state. The Runtime will then apply the returned events onto the embeddings `On()` methods. If the states still differ, it will call the `ResolveUpdateToEvents()` method again until the read models current state matches the updated state. At that point, the events will be committed to the [Event Log]({{< ref "docs/concepts/event_store#event-log" >}}). If the `On()` methods fail, or the Runtime detects that the embeddings state is looping, the process will be stopped and no events will be committed. This means that events will only be committed if they successfully result in the states matching.

Unlike projections, you don't need to specify a [`KeySelector`]({{< ref "docs/concepts/projections#key-selector" >}}) for the `On()` methods. The Runtime will automatically calculate a unique [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}) for the committed events based on the embeddings [Key]({{< ref "docs/concepts/embeddings#key" >}}).


{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// DishCounter.ts
import { ProjectionContext, projection, on } from '@dolittle/sdk.projections';
import { DishPrepared } from './DishPrepared';

@projection('98f9db66-b6ca-4e5f-9fc3-638626c9ecfa')
export class DishCounter {
    numberOfTimesPrepared: number = 0;

    @on(DishPrepared, _ => _.keyFromProperty('Dish'))
    dishPrepared(event: DishPrepared, projectionContext: ProjectionContext) {
        this.numberOfTimesPrepared ++;
    }
}
```
The `@projection()` decorator identifies this Projection in the Runtime, and is used to keep track of the events that it processes, and retrying the handling of an event if the handler fails (throws an exception). If the Projection is changed somehow (eg. a new `@on()` decorator or the `EventType` changes), it will replay all of it's events.

When an event is committed, the method decoratored with `@on()` will be called for all the Projections that handle that `EventType`. The second parameter in the `@on` decorator is a callback function, that defines what property on the event will be used as the read model's key (or id). You can choose either `_ => _.keyFromEventSource()`, `_ => _.keyFromPartitionId()` or a property from the event with `_ => _.keyFromProperty('propertyName')`.
{{% /tab %}}
{{< /tabs >}}

{{< alert title="Committing embeddings events outside of embedding" color="warning" >}}
Only the embedding can commit the types of events that it handles, so that it's the only source of those particular event types. This is because the embedding is trying to event source the state of the external system, which is the real "source of truth". If the embedding would start receiving events coming from somewhere else it would be as another competing "source of truth" had appeared.

To enforce this, the embedding works like an [Aggregate]({{< ref "docs/concepts/aggregates" >}}) and keeps track of how many events it has handled and what is the events expected [`AggregateRootVersion`]({{< ref "docs/concepts/aggregates#version" >}}).
{{< /alert >}}

## Register and update the  `Employee` Embedding
Let's register the new event types, the embedding and update it's state.

{{< tabs name="client_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Projections;
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
                    builder.RegisterEmbedding<DishCounter>())
                .Build();
            _ = client.Start();

            // wait for the registration to complete
            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

            // create a mock of the state received from
            // the external HR system
            var updatedEmployee = new Employee
            {
                Name = "Mr. Taco",
                Workplace = "Street Food Taco Truck"
            };

            await client.Embeddings
                .ForTenant(TenantId.Development)
                .Update(updatedEmployee.Name, updatedEmployee);
        }
    }
}
```
The `Update()` method tries to update the embeddings read model with the specified key to match the updated state. If no read model exists with the key, it will create one with the read model set to the embeddings initial state.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
```

The `getAll(DishCounter)` method returns all Projections for that particular type. The returned object is a map of each projections' key and that projections' current state.

The GUID given in `commit(event, 'event-source-id')` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}
{{< /tabs >}}

Let's check the database, we should see 2 events committed.


{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

## Run your microservice
Run your code, and see the different dishes:

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
```
{{% /tab %}}
{{< /tabs >}}



## Add `Chef` read model

Let's add another read model to keep track of all the chefs and . This time let's only create the class for the read model:

{{< tabs name="chef_tab" >}}
{{% tab name="C#" %}}
```csharp
// Chef.cs
using System.Collections.Generic;

namespace Kitchen
{
    public class Chef
    {
        public string Name = "";
        public List<string> Dishes = new List<string>();
    }
}
```

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// Chef.ts
export class Chef {
    constructor(
        public name: string = '',
        public dishes: string[] = []
    ) { }
}
```
{{% /tab %}}
{{< /tabs >}}

## Create and get the inline projection for `Chef` read model
You can also create a Projection inline in the client building steps instead of declaring a class for it.

Let's create an inline Projection for the `Chef` read model:

{{< tabs name="second_client_tab" >}}
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
        public async static Task Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .WithProjections(builder => {
                    builder.RegisterProjection<DishCounter>();

                    builder.CreateProjection("0767bc04-bc03-40b8-a0be-5f6c6130f68b")
                        .ForReadModel<Chef>()
                        .On<DishPrepared>(_ => _.KeyFromProperty(_ => _.Chef), (chef, @event, projectionContext) => {
                            chef.Name = @event.Chef;
                            if (!chef.Dishes.Contains(@event.Dish)) chef.Dishes.Add(@event.Dish);
                            return chef;
                        });
                })
                .Build();

            var started = client.Start();

            var eventStore = client.EventStore.ForTenant(TenantId.Development);

            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Avocado Artillery Tortilla", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Chili Canon Wrap", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);

            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

            var dishes = await client.Projections
                .ForTenant(TenantId.Development)
                .GetAll<DishCounter>().ConfigureAwait(false);

            foreach (var (dish, state) in dishes) {
                 Console.WriteLine($"The kitchen has prepared {dish} {state.State.NumberOfTimesPrepared} times");
            }

            var chef = await client.Projections
                .ForTenant(TenantId.Development)
                .Get<Chef>("Mrs. Tex Mex").ConfigureAwait(false);
            Console.WriteLine($"{chef.Key} has prepared {string.Join(", ", chef.State.Dishes)}");

            // Blocks until the EventHandlers are finished, i.e. forever
            await started.ConfigureAwait(false);
        }
    }
}
```

The `Get<Chef>('key')` method returns a Projection instance with that particular key. The key is declared by the `KeyFromProperty(_.Chef)` callback function on the `On()` method. In this case, the id of each `Chef` projection instance is based on the chefs name.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';
import { DishCounter } from './DishCounter';
import { Chef } from './Chef';

const client = Client
    .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(builder =>
        builder.register(DishHandler))
    .withProjections(builder => {
        builder.register(DishCounter);

        builder.createProjection('0767bc04-bc03-40b8-a0be-5f6c6130f68b')
            .forReadModel(Chef)
            .on(DishPrepared, _ => _.keyFromProperty('Chef'), (chef, event, projectionContext) => {
                chef.name = event.Chef;
                if (!chef.dishes.includes(event.Dish)) chef.dishes.push(event.Dish);
                return chef;
            });
    })
    .build();

(async () => {
    const eventStore = client.eventStore.forTenant(TenantId.development);

    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mrs. Tex Mex'),'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Avocado Artillery Tortilla', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Chili Canon Wrap', 'Mrs. Tex Mex'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');

    setTimeout(async () => {
        for (const [dish, { state: counter }] of await client.projections.forTenant(TenantId.development).getAll(DishCounter)) {
            console.log(`The kitchen has prepared ${dish} ${counter.numberOfTimesPrepared} times`);
        }

        const chef = await client.projections.forTenant(TenantId.development).get<Chef>(Chef, 'Mrs. Tex Mex');
        console.log(`${chef.key} has prepared ${chef.state.dishes}`);
    }, 1000);
})();
```

The `get<Chef>(Chef, 'key')` method returns a Projection instance with that particular key. The key is declared by the `keyFromProperty('Chef')` callback function on the `on()` method. In this case, the id of each `Chef` projection instance is based on the chefs name.
{{% /tab %}}
{{< /tabs >}}

## Run your microservice with the inline `Chef` projection

Run your code, and get a delicious serving of taco:

{{< tabs name="second_run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
Mrs. Tex Mex has prepared Bean Blaster Taco,Chili Canon Wrap
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
Mrs. Tex Mex has prepared Bean Blaster Taco,Chili Canon Wrap
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
