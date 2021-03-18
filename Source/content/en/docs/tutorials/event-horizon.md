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
* a [Producer]({{< ref "docs/concepts/event_horizon#producer" >}}) Microservice that commits and handles a [Public Event]({{< ref "docs/concepts/events#public-vs-private" >}}) and filters it into a [Public Stream]({{< ref "docs/concepts/streams#publicvs-private-streams" >}}) and
* a [Consumer]({{< ref "docs/concepts/event_horizon#consumer" >}}) Microservice that [Subscribes]({{< ref "docs/concepts/event_horizon#subscription" >}}) to the consumers public stream over the [Event Horizon]({{< ref "docs/concepts/event_horizon" >}}) and processes those public events

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/EventHorizon) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/EventHorizon).

### Pre requisites
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

This tutorial builds directly upon and that you have gone through our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide; that you have the files from the tutorial.

### Setup
In this tutorial is going to have a slightly different setup as we're going to have two microservices; one that produces public events and one that subscribe to those public events. Let's make a folder structure that resembles that:

    └── event-horizon-tutorial/
        ├── consumer/
        ├── producer/
        └── environment/
            └── docker-compose.yml

Go into both the *consumer* and the *producer* folders and initiate the project as we've gone through in our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide. I.e copy over all the code from the getting started tutorial to the *consumer* and *producer* folders. You can choose different languages for the microservices if you want to.

We'll come back to the docker-compose [later]({{< ref "#setup-your-environment" >}}) in this tutorial.

## Producer
### Create a `Public Filter`
A [`public filter`]({{< ref "docs/concepts/event_handlers_and_filters#public-filters" >}}) filters all public events that pass the filter into a [`public stream`]({{< ref "docs/concepts/streams" >}}), which is special stream that another microservice can [subscribe]({{< ref "docs/concepts/event_horizon#subscription" >}}) to.

A public filter is defined as a method that returns a partitioned filter result, which is an object with two properties:
- a boolean that says whether the event should be included in the public stream
- a partition id which is the [partition]({{< ref "docs/concepts/streams/#partitions" >}}) that the event should belong to in the public stream.

Only public events get filtered through the public filters.  

{{< tabs name="public-filter-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Dolittle.SDK.Events;
using Dolittle.SDK.Events.Filters;

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
import { EventContext, PartitionId } from '@dolittle/sdk.events';
import { PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
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
Notice that the returned PartitionedFilterResult has `true` and an *unspecified* PartitionId (which is the same as an empty GUID). This means that this filter creates a public stream that includes all public events, and that they are put into the *unspecified* partition of that stream.

### Commit the public event
Now that we have a public stream we can commit public events to start filtering them. Let's commit a *DishPrepared* event as a public event from the producer microservice:

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
    .commitPublic(preparedTaco, 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');

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
using System;
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

{{% /tab %}}
{{< /tabs >}}
Now as you can see there is lots of stuff going on here. Let's try and disect this piece for piece.

{{< tabs name="with-runtime-on-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
.WithRuntimeOn("localhost", 50055)
// Rest of builder here...

```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
.withRuntimeOn('localhost', 50055)
// Rest of builder here...

```
{{% /tab %}}
{{< /tabs >}}
The previous tutorials has not used this builder method before. The reason for that is that there was no need as the default value of this configuration is having a Runtime running on localhost on port 50053.
Since we in this tutorial will end up with two running instances of the Runtime they will have to run with different ports. The *producer* Runtime will be running on the default 50053 port and the consumer Runtime will be running on port 50055.
We'll see this reflected in the `docker-compose.yml` file later in this tutorial.

{{< tabs name="with-event-horizons-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
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
// Rest of builder here...
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
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
// Rest of builder here...

```

{{% /tab %}}
{{< /tabs >}}
This is the most complicated piece of the code, and rightfully so there is a lot of things going on behind the scenes. Let's start at the 'event horizons' part.

#### Event Horizon
An event horizon is a subscription that is submitted to and managed in the Runtime. That subscription belongs to a tenant and it tells the Runtime that it wants to get events from a specific partition in a public stream of a tenant in another microservice (synonym with Runtime).

On the consumer side when the Runtime receives a subscription like this it initiates a background process that will send a subscription request to the producer Runtime. If that request is acknowledged the producer Runtime will start a background process that sends over one event at a time.
The consumer will receive events from the producer and put those events in a specialized event-log that is identified by the *scope* id. We'll talk more about the `scope` when we talk about the event handler.

The acknowledgement part is important, and getting to it depends on two things:

- The consumer needs to know where to access the other microservices, i.e the URL addresses.
- The producer needs to give formal consent for a tenant in another microservice to subscribe to public streams of a tenant.

We'll come back to how this is setup later.

#### Scoped Event Handler
So now that we have a consumer microservice that has subscribed to the producer's public stream `2c087657-b318-40b1-ae92-a400de44e507` the natural progression for us would be to register an event handler that handles those events. This code sequence also introduces a new way of creating event handlers. Previously we've made event handlers as classes in separated files, but the Client Builder gives us the opportunity to create these directly.
This code will create a partitioned event handler with id `6c3d358f-3ecc-4c92-a91e-5fc34cacf27e`. That should feel familiar. The thing that may not be familiar is the *scope* part.
Remember that the event horizon subscription includes a scope and that the events from the that event horizon gets put in a specialized event-log identified by the scope id. Having the scope id defined when creating an event handler signifies that it will only handle events that are put into that scope and no other. Read more about event handlers and scopes [here]({{< ref "docs/concepts/event_handlers_and_filters#scope" >}}).

You can read more about the event horizon [here]({{< ref "docs/concepts/event_handlers_and_filters#scope" >}}).

## Setup your environment
Now that we have the different microservices setup with the code we need to setup the environment for them to run in and configure them to be connected to each other.

First thing you need to do is change directory into the environment folder we created in the beginning of this tutorial. Here we'll have a couple of files:

The first thing that we need to do is to set up [resources]({{< ref "docs/reference/runtime/configuration#resourcesjson" >}}). The reason we have to do this now is that the two microservices needs to have their own [event store]({{< ref "docs/concepts/event_store" >}}) databases running on the same mongo container. In the previous tutorials we could just use the default configurations provided in the Docker image, but for this example we cannot.

Note that the development tenant is `445f8ea8-1a6f-40d7-b2fc-796dba92dc44`.

```json
//consumer-resources.json
{
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": {
        "eventStore": {
            "servers": [
                "mongo"
            ],
            "database": "consumer_event_store"
        }
    }
}
```
```json
//producer-resources.json
{
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": {
        "eventStore": {
            "servers": [
                "mongo"
            ],
            "database": "producer_event_store"
        }
    }
}
```

Then we need to set up the consumer Runtime's [endpoints]({{< ref "docs/reference/runtime/configuration#endpointsjson" >}}) so that we can access it from the SDK and that we can get the communication going between the Runtimes.

```json
//consumer-endpoints.json
{
    "public": {
        "port": 50054
    },
    "private": {
        "port": 50055
    }
}
```

The `50055` port is the port that we configured the consumer with in the *with runtime* method.

Now that we've configured the consumer Runtime to run using different ports than the default *50052* and *50053* ports we need to configure the consumer Runtime to know where it can access the producer Runtime. We do this by giving it a [microservices]({{< ref "docs/reference/runtime/configuration#microservicesjson" >}}) configuration.
```json
//consumer-microservices.json
{
    "f39b1f61-d360-4675-b859-53c05c87c0e6": {
        "host": "producer-runtime",
        "port": 50052
    }
}
```

Now the last piece of the puzzle is to configure the [event horizon consent]({{< ref "docs/reference/runtime/configuration#event-horizon-consentsjson" >}}) that the producer needs to give to the consumer who wants to subscribe to its public stream.

```json
//producer-event-horizon-consents.json
{
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": [
        {
            "microservice": "a14bb24e-51f3-4d83-9eba-44c4cffe6bb9",
            "tenant": "445f8ea8-1a6f-40d7-b2fc-796dba92dc44",
            "stream": "2c087657-b318-40b1-ae92-a400de44e507",
            "partition": "00000000-0000-0000-0000-000000000000",
            // an identifier for this consent. This is random
            "consent": "ad57aa2b-e641-4251-b800-dd171e175d1f"
        }
    ]
}

```

Now that all the configuration files are done we just need to glue it all together in a `docker-compose.yml` and start the environment.

```yml
version: '3.1'
services:
  mongo:
    image: dolittle/mongodb
    hostname: mongo
    ports:
      - 27017:27017
    logging:
      driver: none
 
  consumer-runtime:
    image: dolittle/runtime
    volumes:
      - ./consumer-resources.json:/app/.dolittle/resources.json
      - ./consumer-endpoints.json:/app/.dolittle/endpoints.json
      - ./consumer-microservices.json:/app/.dolittle/microservices.json
    ports:
      - 50054:50054
      - 50055:50055

  producer-runtime:
    image: dolittle/runtime
    volumes:
      - ./producer-resources.json:/app/.dolittle/resources.json
      - ./producer-event-horizon-consents.json:/app/.dolittle/event-horizon-consents.json
    ports:
      - 50052:50052
      - 50053:50053

```

### Start the Dolittle environment
Start the docker-compose with this command

```shell
$ docker-compose up
```

This will spin up a mongo container and two Runtimes.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

### Run your microservices
Run your code, and see the consumer event handler handle the event from the producer microservice!

In both consumer and producer folders run this command (it does not matter which you start first)
{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
