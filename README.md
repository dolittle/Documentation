# Documentation
[![Netlify Status](https://api.netlify.com/api/v1/badges/dbad4963-107d-451b-bd0a-5ffcf63c65e5/deploy-status)](https://app.netlify.com/sites/dolittle-io/deploys)

This repository contains the source for the Dolittle documentation website.

Built with the [docsy](https://github.com/google/docsy) Hugo template.

## Cloning
This repository has a sub module, clone it with:
```shell
$ git clone --recursive https://github.com/dolittle/Documentation.git
```

If you've already cloned it, you can get the submodule by doing the following:
```shell
$ git submodule update --init --recursive
```

This might take a while.

## Developing
Check docsy [documentation](https://www.docsy.dev/docs/) for how to build and customize stuff.

You'll need Hugo extended `v0.71` or higher.

Markdown files are either in  `Source/content` or symlinks to their respective submodules from `Repositories/`.

If you want to do SCSS edits and want to publish these, you need to install `PostCSS` (not needed for `hugo server`):

```bash
cd Source/
npm install
```

### Running the website locally

Once you've cloned the site repo, from the repo root folder, run:

```
hugo server
```

### Build your local Dolittle repository documentation
* [Docker](https://www.docker.com/get-started)
* Download [dolittle-documentation-server](https://github.com/dolittle/Development/blob/master/Source/Documentation/dolittle-documentation-server) script and add add it to your path

Run the [dolittle-documentation-server](https://github.com/dolittle/Development/blob/master/Source/Documentation/dolittle-documentation-server) script from withing your local Dolittle git repository that you want to edit. The script will automatically mount the correct folders inside the docker image and start a Hugo server that will watch for changes.

It doesn't matter which subfolder you're in as long as your in the git repository.
```
dolittle-documentation-server
```



### Running a container locally

You can run docsy-example inside a [Docker](ihttps://docs.docker.com/)
container, the container runs with a volume bound to the `docsy-example`
folder. This approach doesn't require you to install any dependencies other
than Docker.

1. Build the docker image 

```bash
./dockerize.sh
```

1. Run the built image

```bash
docker run --publish 1313:1313 --detach --mount src="$(pwd)",target=/home/docsy/app,type=bind dolittle/documentation:latest
```

Open your web browser and type `http://localhost:1313` in your navigation bar,
This opens a local instance of the docsy-example homepage. You can now make
changes to the docsy example and those changes will immediately show up in your
browser after you save.

To stop the container, first identify the container ID with:

```bash
docker container ls
```

Take note of the hexadecimal string below the `CONTAINER ID` column, then stop
the container:

```bash
docker stop [container_id]
```

To delete the container run:

```
docker container rm [container_id]
```

## Issues and Contributing
To learn how to contribute please read our [contributing](https://dolittle.io/contributing/) guides.

## Our other projects:
 - [Runtime](https://github.com/dolittle/Runtime)
 - [C# SDK](https://github.com/dolittle/DotNet.SDK)
 - [JavaScript SDK](https://github.com/dolittle/JavaScript.SDK)
