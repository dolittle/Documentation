# Documentation
[![Netlify Status](https://api.netlify.com/api/v1/badges/dbad4963-107d-451b-bd0a-5ffcf63c65e5/deploy-status)](https://app.netlify.com/sites/dolittle-io/deploys)

This repository contains the source for the Dolittle documentation website.

## Cloning
This repository has a sub module, clone it with:
```shell
$ git clone --recursive <repository url>
```

If you've already cloned it, you can get the submodule by doing the following:
```shell
$ git submodule update --init --recursive
```

## Developing
All documentation is generated using [Hugo 0.58.3](https://gohugo.io), with the [Dot](https://github.com/Gethugothemes/dot-hugo-documentation-theme.git) theme.

Markdown files are either in  `Source/content` or symlinks to their respective submodules from `Source/repositories`.

### Build locally
For manually building the project you'll need Hugo 0.58.3.
```terminal
cd Source
hugo serve
```

### Build your local Dolittle repository documentation
* [Docker](https://www.docker.com/get-started)
* Download [dolittle-documentation-server](https://github.com/dolittle/Development/blob/master/Source/Documentation/dolittle-documentation-server) script and add add it to your path

Run the [dolittle-documentation-server](https://github.com/dolittle/Development/blob/master/Source/Documentation/dolittle-documentation-server) script from withing your local Dolittle git repository that you want to edit. The script will automatically mount the correct folders inside the docker image and start a Hugo server that will watch for changes.

It doesn't matter which subfolder you're in as long as your in the git repository.
```
cd ~/Dolittle/Documentation
dolittle-documentation-server
```

## Issues and Contributing
To learn how to contribute please read our [contributing](https://dolittle.io/contributing/) guides.

## Our other projects:
 - [Runtime](https://github.com/dolittle/Runtime)
 - [C# SDK](https://github.com/dolittle/DotNet.SDK)
 - [JavaScript SDK](https://github.com/dolittle/JavaScript.SDK)
