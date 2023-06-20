---
title: "Documentation"
linkTitle: "Documentation"
weight: 20
menu:
  main:
    weight: 20
---

Dolittle is an open-source, decentralized, distributed and event-driven microservice platform. The platform has been designed to build Line of Business applications without sacrificing architectural quality, code quality, maintainability or scalability.

### Dedicated Runtime
Dolittle uses it's own dedicated [Runtime]({{< ref "concepts/overview" >}}) for managing connections to the event logs and other runtimes. This allows for easier decoupling of event producers and consumers and frees the pieces to be scaled independently.

### Microservice First
At the heart of Dolittle sits the notion of decoupling. This makes it possible to take a system and break it into small focused components
that can be assembled together in any way one wants to. When it is broken up you get the benefit of scaling each individual piece on its own, rather than scaling the monolith
equally across a number of machines. This gives a higher density, better resource utilization and ultimately better cost
control.

### Event-Driven
Dolittle is based on Event Sourcing, which means that the systems state is based on events. 
EDA promotes loose coupling because the producers of events do not know about subscribers that are listening to this event. This makes an Event-Driven Architecture more suited to today’s distributed applications than the traditional request-response model.

### PaaS Ready
Dolittle has it's own PaaS (Platform as a Service) for hosting your Dolittle code, get in [contact with us](https://dolittle.com/contact) to learn more!
