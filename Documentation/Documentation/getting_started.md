---
title: Get started
description: Get started writing documentation locally
keywords: Contributing
author: einari, joel
weight: 1
alias: getting_started
---

All of Dolittles documentation is open-source and hosted on GitHub.

## Quick edits online
You can edit and create pull request for documentation online straight from [dolittle.io](https://dolittle.io/).

1. Click the **pencil** icon next to the document title at the top of the page you want to edit. This takes you to the pages GitHub source file.
2. Make your changes in the web editor.
3. Once you have made your changes click **Propose file change** at the end of the page.
4. On the next page click **Create pull request** and add a title for the pull request.

## Editing dolittle.io locally
You can run your own copy of dolittle.io on your local machine. This way you get a feeling for how it will look like and verify that links, images and diagrams are correct.

### Prerequisites
[Hugo](https://gohugo.io/getting-started/installing/#binary-cross-platform)

[Docker](https://www.docker.com/get-started)

[Dolittle development scripts](https://github.com/dolittle/Development/) and add them to your path.

### Run your local Hugo webserver

Run the [dolittle-documentation-server](https://github.com/dolittle/Development/blob/master/Source/Documentation/dolittle-documentation-server) script from withing your local Dolittle git repository. The script will automatically mount the correct folders inside the docker image and start a Hugo webserver that will watch the changes.

It doesn't matter which subfolder you're in as long as your in the git repository.

```
cd ~/Dolittle/Documentation
dolittle-documentation-server
```

The output looks like this:
```shell
Mounting folder /home/joel/Dolittle/Documentation to /Documentation

                   | EN
+------------------+-----+
  Pages            | 383
  Paginator pages  |   0
  Non-page files   |  53
  Static files     |  26
  Processed images |   0
  Aliases          | 107
  Sitemaps         |   1
  Cleaned          |   0

Built in 1052 ms
Watching for changes in /Documentation/{Documentation,Source}
Watching for config changes in /Documentation/Source/config.toml
Environment: "development"
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at //localhost:1313/ (bind address 0.0.0.0)
Press Ctrl+C to stop

```

In your browser navigate to [localhost:1313](localhost:1313) to see the documentation, the page will live reload your changes. Any errors will be displayed on the docker output.

You are now ready to write documentation in your local repository. Read the [overview](./overview.md) and [style guide](./style_guide) for more information on how you should be writing documentation.

## Add a new repository to the main Documentation repository

You'll have to start by cloning the [Documentation repository](https://github.com/dolittle/Documentation), which has sub modules:

```shell
$ git clone --recursive https://github.com/dolittle/documentation
```

If you've already cloned it, you can get the submodules by doing the following:

```shell
$ git submodule update --init --recursive
```

### Create documentation for the new repository

At the root of the working repository, create a `Documentation` folder with at least a matching `_index.md` and other
markdown files if needed. Read our guide on [creating documentation]({{< relref "/contributing/documentation/_index.md" >}}) for more information.

### Adding the working repository as a submodule

In the Documentation repository, navigate to the `Source/repositories/` folder and then into the corresponding Organisation folder (e.g. fundamentals, runtime, interaction etc). If the organisation is "dolittle" then use the repository name eg ["learning"](https://github.com/dolittle/Learning)

Pull your working repository here as a **submodule**:

```shell
$ git submodule add <repository_url> <repository_name>
```

{{% notice tip %}}
Organisation/repository name inside `Source/repositories` has to be in lower case.
{{% /notice %}}

Example from [dolittle/Documentation](https://github.com/dolittle/Documentation) root:

```shell
cd Source/repositories
$ git submodule add https://github.com/dolittle-fundamentals/dotnet.fundamentals.git dotnet.fundamentals
```

## Linking submodules to `content`

The system relies on all documentation content sitting in the `Source/content` folder. This includes markdown files, images and other resources you link to your documentation.

The `content` folder contains the parent folders, with a matching `_index.md` and the contents of the `Documentation` folder from the repository directly in this.

This is done by creating a symbolic link to the repositories `Documentation` folder.

```
<Documentation root>
└── Source
    └── content
        └── fundamentals
        └── runtimes
        └── ...
```

Open a shell and **navigate to the correct sub-folder in the `content` folder** and then in the **corresponding organisation folder.**

Unix:

```shell
$ ln -s ../../repositories/<organisation-folder>/<repository>/Documentation <folder-name>
```

Windows:

```shell
c:> mklink /d <folder-name> ..\..\repositories\<organisation-folder>\<repository>\Documentation
```

Example:

Unix:

```shell
$ ln -s ../../repositories/runtime/Runtime/Documentation runtime
```

Windows:

```shell
c:> mklink /d runtime c:\Projects\Dolittle\Documentation\Source\repositories\runtime\Runtime\Documentation
```

Chances are you are contributing to the code of the repository and you can therefor leave it in place and maintain
code and documentation side-by-side.

{{% notice tip %}}
All folder names given in this process will act as URL segments, be very carefull to change these after they have been deployed.
{{% /notice %}}

## Keep main Documentation syncronized with the working repository

An Azure pipeline keeps the main Documentation repository up-to-date automatically when modification is made in a repository.

To use that from a working repository, a simple pipeline is needed to call the Documentation update.

azure-pipeline.yml :

```yml
trigger:
    - master

resources:
    repositories:
        - repository: templates
          type: github
          name: dolittle-tools/AzureDevOps
          endpoint: dolittle-tools

jobs:
    - template: Source/Documentation/documentation.yml@templates
```

You can use another template if needed but `Source/Documentation/documentation.yml` has to be triggered.

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/). 

Markdown can be written using simple text editors (Pico, Nano, Notepad), but more thorough editors like [Visual Studio Code](http://code.visualstudio.com/) or [Sublime Text](http://sublimetext.com) are highly recommended. VSCode also has a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

Read the [overview](./overview.md) and [style guide](./style_guide) for more information.

{{% alert "success" %}}Happy documenting{{% /alert %}}
