---
title: Typescript Build
description: Learn about the basic building block for building TypeScript applications
keywords: Tools, typescript, build 
author: woksin
weight: 1
repository: https://github.com/dolittle-tools/TypeScript.Build
aliases: /tooling/typescript/build/
---

We have a common [Typescript Build Package](https://www.npmjs.com/package/@dolittle/typescript.build) that bundles all the basic tools that we use for setting up our TypeScripts projects.

Essentially all this package does is provide the building blocks you'd need for a TypeScript project using Mocha + Sinon + Chai for testing. We build upon this package and extend it in order to provide pre-configured build packages for building TypeScript libraries using gulp and node, and client applications using webpack.

## Project Structure Model
The package, [@dolittle/typescript.build](https://www.npmjs.com/package/@dolittle/typescript.build), exposes a class called *Project()* which, when constructed, generates a structure model of the typescript project from the *package.json* file at the given directory or the directory at the current working directory of the node instances that's running. It will then expose the essential package details and also crate absolute paths and glob-patterns for files you might be interested in like for example; source files, tests, build destination folder, etc...

### Project Structure Conventions
To make the process of creating the project structure model it has to stick with a few, simple, conventions.

* All packages must have a file called *package.json* sitting in its root 
* All packages must have a file called *tsconfig.json* sitting in its root 
* Source files has to be either in the root of the project (next to package.json file) or under a Source folder if it's not a yarn workspace package.
* Output folder is called Distribution
* Tests has to be together with the source files and under folders with the pattern 'for_*'. Setup files for tests sit together with the tests under folders called 'given' 
* Yarn workspace packages should have their own folders and sit under the Source folder in the root of the project. 

## Testing
We use [Mocha](https://mochajs.org) as a foundation for our tests. We provide a [simple startup configuration for mocha](https://github.com/dolittle-tools/TypeScript.Build/blob/master/mocha.opts.js) that is required and used as setup when doing tests with mocha through our higher-level build packages for TypeScript. [Our build package for TypeScript node applications](https://github.com/dolittle-tools/TypeScript.Build.Node) uses this.


## Dolittle TypeScript Build Packages
We have made additional build packages which extends upon this which provides easy setup of Node and Client TypeScript applications.

* [Node](./node)
* Client (Coming soon)
* Aurelia Client (Coming soon)