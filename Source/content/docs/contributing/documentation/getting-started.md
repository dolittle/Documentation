---
title: Get started
description: Get started writing documentation locally
keywords: Contributing
author: einari, joel
weight: 1
alias: getting_started
---

All of Dolittles documentation is open-source and hosted on GitHub.

## Add a new repository to the main Documentation repository

This guide teaches you how to add a new repository to the Dolittle documentation [structure](./structure).

Start by cloning the [Documentation repository](https://github.com/dolittle/Documentation) and its submodules:

```shell
$ git clone --recursive https://github.com/dolittle/documentation
```

If you've already cloned it, you can get the submodules by doing the following:

```shell
$ git submodule update --init --recursive
```

### 1. Create documentation for the new repository

At the root of the working repository, create a `Documentation` folder with at least a matching `_index.md` and other
markdown files if needed. Read our guide on [structure](./structure) for more information.

### 2. Adding the working repository as a submodule

In the Documentation repository, navigate to the `Source/repositories/` folder and pull your working repository here as a **submodule**:

```shell
$ git submodule add <repository_url> <repository_name>
```

### 3. Linking submodules to `content`

The [system](./structure) relies on all documentation content sitting in the `Source/content` folder. This includes markdown files, images and other resources you link to your documentation.

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

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/). 

Markdown can be written using simple text editors (Pico, Nano, Notepad), but more thorough editors like [Visual Studio Code](http://code.visualstudio.com/) or [Sublime Text](http://sublimetext.com) are highly recommended. VSCode also has a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

Read the [writing guiden](./writing_guide) and [style guide](./style_guide) for more information.

{{% alert "success" %}}Happy documenting{{% /alert %}}
