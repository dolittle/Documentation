---
title: Event Horizon
description: Get started with the Event Horizon
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 20
aliases:
- /docs/tutorials/csharp/event-horizon
- /docs/tutorials/typescript/event-horizon
- /docs/tutorials/event-horizon
---

Welcome to the tutorial for Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that keeps track of foods prepared by the chefs.

After this tutorial you will have:

* a running Dolittle environment with two [Runtimes]({{< ref "docs/concepts/overview" >}}) and a MongoDB,
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits and handles [Events]({{< ref "docs/concepts/events" >}}) and puts it in a public stream and
* a Microservice that subscribes to the public stream and processes those events

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Aggregates) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Aggregates).

### Pre requisites
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

This tutorial builds directly upon and that you have gone through our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide; done the setup, created the EventType, EventHandler and connected the client

### Setup
In this tutorial is going to have a slightly different setup as we're going to have two microservices; one that produces public events and one that subscribe to those public events. For that reason you should have a folder structure to resembles that. I would recommend this particular folder structure for this tutorial:

    event-horizon-tutorial
        consumer
            ...
        producer
            ...
        environment
            docker-compose.yml
            ...

Go into both the *consumer* and the *producer* folders and initiate the project as we've gone through in our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide.

We'll come back to the docker-compose later in this tutorial.

## Producer
### Create a `Public Filter`
A [`public stream`]({{< ref "docs/concepts/streams" >}}) is a filter that filters all events that are committed as public into a public stream, which is special stream that another microservice can subscribe to. A public filter definition in the SDK's perspective is simply a method that returns a partitioned filter result which simply is an object with two properties: a boolean that says whether the event should be included in the stream and a partition id which is the partition that the event should belong to in the stream. Only the events that are committed as a public events gets filtered through the public filters.  

{{< tabs name="public-filter-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Dolittle.SDK.Events;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .WithFilters(filtersBuilder =>
                    filtersBuilder
                        .CreatePublicFilter("2c087657-b318-40b1-ae92-a400de44e507", filterBuilder =>
                            filterBuilder.Handle((@event, eventContext) =>
                            {
                                Console.WriteLine($"Filtering event {@event} to public stream");
                                return Task.FromResult(new PartitionedFilterResult(true, PartitionId.Unspecified));
                            })))
                .Build();
            // Rest of your code here...
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';

const client = Client
    .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(builder =>
        builder.register(DishHandler))
    .withFilters(filterBuilder =>
        filterBuilder
            .createPublicFilter('2c087657-b318-40b1-ae92-a400de44e507', fb =>
                fb.handle((event: any, context: EventContext) => {
                    console.log(`Filtering event ${event} to public stream`);
                    return new PartitionedFilterResult(true, PartitionId.unspecified);
                })
            ))
    .build();
    // Rest of your code here...

```
{{% /tab %}}
{{< /tabs >}}
Notice that the returned PartitionedFilterResult always has true and the *unspecified* PartitionId. This means that this particular public stream includes all public events and they are put in the *unspecified* partition (which is the empty guid)

### Commit the public event
Now that we have a public stream we'd naturally want to commit public events to fill it up. Doing this is as easy as committing private (non-public) events. Let's show you an example where we commit a *DishPrepared* event as a public event.

{{< tabs name="commit_public_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            // Where you build the client...

            var preparedTaco = new DishPrepared("Bean Blaster Taco", "Mr. Taco");

            client.EventStore
                .ForTenant(TenantId.Development)
                .CommitPublicEvent(preparedTaco, "bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9")
                .GetAwaiter().GetResult();

            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';

// Where you build the client...

const preparedTaco = new DishPrepared('Bean Blaster Taco', 'Mr. Taco');

client.eventStore
    .forTenant(TenantId.development)
    .commit(preparedTaco, 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');

})();
```
{{% /tab %}}
{{< /tabs >}}

## Consumer
### Subscribe to the public stream of events
Now that we have a microservice with a public stream of *DishPrepared* events now the only thing left is to have another microservice subscribes to that subscribes to that public stream of events.

{{< tabs name="event-horizon-subscription-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Dolittle.SDK.Events;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            var client = Client.ForMicroservice("a14bb24e-51f3-4d83-9eba-44c4cffe6bb9")
                .WithRuntimeOn("localhost", 50055)
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(_ =>
                    _.CreateEventHandler("6c3d358f-3ecc-4c92-a91e-5fc34cacf27e")
                        .InScope("808ddde4-c937-4f5c-9dc2-140580f6919e")
                        .Partitioned()
                        .Handle<DishPrepared>((@event, context) => Console.WriteLine($"Handled event {@event} from public stream")))
                .WithEventHorizons(eventHorizons => {
                    eventHorizons.ForTenant(TenantId.Development, subscriptions => {
                        subscriptions
                            .FromProducerMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                            .FromProducerTenant(TenantId.Development)
                            .FromProducerStream("2c087657-b318-40b1-ae92-a400de44e507")
                            .FromProducerPartition(PartitionId.Unspecified)
                            .ToScope("808ddde4-c937-4f5c-9dc2-140580f6919e");
                    });
                })
                .Build();
            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { PartitionId } from '@dolittle/sdk.events';
import { DishPrepared } from './DishPrepared';

const client = Client
    .forMicroservice('a14bb24e-51f3-4d83-9eba-44c4cffe6bb9')
    .withRuntimeOn('localhost', 50055)
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(eventHandlers =>
        eventHandlers
            .createEventHandler("6c3d358f-3ecc-4c92-a91e-5fc34cacf27e", _ =>
                _.inScope("808ddde4-c937-4f5c-9dc2-140580f6919e")
                .partitioned()
                .handle(DishPrepared, (event, context) => console.log(`Handled event ${event} from public stream`))))
    .withEventHorizons(_ => {
        _.forTenant(TenantId.development, ts => {
            ts.fromProducerMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
                .fromProducerTenant(TenantId.development)
                .fromProducerStream('2c087657-b318-40b1-ae92-a400de44e507')
                .fromProducerPartition(PartitionId.unspecified.value)
                .toScope('808ddde4-c937-4f5c-9dc2-140580f6919e');
            });
    })
    .build();

```
Now as you can see there is lots of stuff going on here. Let's try and disect this piece for piece.

### Start the Dolittle environment
Start the Dolittle environment with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

### Run your microservice
Run your code, and get a delicious serving of taco:

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
