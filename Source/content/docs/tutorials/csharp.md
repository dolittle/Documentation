---
title: C#
description: Get started with the Dolittle C# SDK using TypeScript
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET
author: joel, jakob, sindre
weight: 1
---

Welcome to the Dolittle C# tutorial for the [.NET SDK](https://github.com/dolittle/dotnet.sdk) where you learn how to write a microservice that keeps track of foods prepared by the chefs.

This tutorial expects you to have a basic understanding of C#, .NET and Docker.

After this tutorial you will have:

* a running Dolittle Runtime and MongoDB, and
* a Microservice that commits and handles events

Full tutorial code available on [GitHub](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Kitchen).

### What you'll need
Install and configure the required prerequisites locally first:

* [.NET Core SDK](https://dotnet.microsoft.com/download)
* [Docker](https://www.docker.com/products/docker-desktop)

### Setup a .NET Core console project
Setup a .NET Core console project:

```shell
$ dotnet new console
$ dotnet add package Dolittle.SDK 
```

### Create an `EventType`
First we'll create an `EventType` that represents that a dish has been prepared. Events represents changes in the system, a _"fact that has happened"_. As the event _"has happened"_, it's immutable by definition, and we should name it in the past tense accordingly.

```csharp
// DishPrepared.cs
using Dolittle.SDK.Events;

namespace Kitchen 
{
    [EventType("1844473f-d714-4327-8b7f-5b3c2bdfc26a")]
    public class DishPrepared
    {
        public DishPrepared (string dish, string chef)
        {
            Dish = dish;
            Chef = chef;
        }
        public string Dish { get; }
        public string Chef { get; }
    }
}
```

An `EventType` is a class that defines the properties of the event. The GUID given in the `[EventType()]` attribute is used to identify this `EventType` type in the Runtime.

### Create an `EventHandler`
Now we need something that can react to dishes that has been prepared. Let's create an `EventHandler` which prints the prepared dishes to the console.

```csharp
// DishHandler.cs
using System;
using Dolittle.SDK.Events;
using Dolittle.SDK.Events.Handling;

namespace Kitchen
{
    [EventHandler("f2d366cf-c00a-4479-acc4-851e04b6fbba")]
    public class DishHandler
    {
        public void Handle(DishPrepared @event, EventContext eventContext)
        {
            Console.WriteLine($"{@event.Chef} has prepared {@event.Dish}. Yummm!");
        }
    }
}
```

When an event is committed, the `Handle()` method will be called for all the `EventHandlers` that handle that `EventType`.

The `[EventHandler()]` attribute identifies this event handler in the Runtime, and is used to keep track of which event it last processed, and retrying the handling of an event if the handler fails (throws an exception).

### Connect the client and commit an event
Let's build a client that connects to the Runtime for a Microservice with the id `"f39b1f61-d360-4675-b859-53c05c87c0e6"`. This sample Microservice is pre-configured in the `development` Docker image.

While configuring the client we register the `EventTypes` and `EventHandlers` so that the Runtime knows about them. Then we can prepare a delicious taco and commit it to the `EventStore` for the specified tenant.

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
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .Build();

            var preparedTaco = new DishPrepared("Bean Blaster Taco", "Mr. Taco");

            client.EventStore
                .ForTenant(TenantId.Development)
                .Commit(eventsBuilder =>
                    eventsBuilder
                        .CreateEvent(preparedTaco)
                        .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"));

            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```

The GUID given in `FromEventSource()` is used to identify where the events come from.

### Start the Dolittle Runtime
Start the Dolittle Runtime with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

### Run your microservice
Run your code, and get a delicious serving of taco:

```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
