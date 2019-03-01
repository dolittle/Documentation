---
title: Getting started
description: Learn how to get started with documentation
keywords: Contributing
author: einari
weight: 1
---

Writing documentation can be done by just working on each repository individually or you can work with the documentation
engine and see the end result while working. This is a good idea to get a feeling for how it will look like and verify
that links, images and diagrams are correct.

You'll have to start by cloning the Documentation repository, which has sub modules:

```shell
$ git clone --recursive https://github.com/dolittle/documentation
```

If you've already cloned it, you can get the submodules by doing the following:

```shell
$ git submodule update --init --recursive
```

The system is relying on all content sitting in the `content` folder:

```
<repository root>
└── Source
    └── Hugo
        └── content
```

## Linking to repositories

The `repositories.json` file configures at which path (sub-folder) under the content folder repositories will be linked to, and with which name. The content folder should contain the parent folders, with a matching `_index.md` and the contents of the `Documentation` folder from the repository directly in this.
This is best achieved by creating a symbolic link to the repositories `Documentation` folder.

Open a shell and **navigate to the correct sub-folder in the `content` folder**.

Unix:
```shell
$ ln -s <repository-folder>/Documentation <folder-name>
```

Windows:
```shell
c:> mklink /d <folder-name> <repository-folder>\Documentation 
```

Example:

Unix:
```shell
$ ln -s /Projects/Dolittle/Runtime/Documentation overview
```

Windows:
```shell
c:> mklink /d overview c:\Projects\Dolittle\Runtime\Documentation 
```

Chances are you are contributing to the code of the repository and you can therefor leave it in place and maintain
code and documentation side-by-side.

## Automatically link to local repositories

As an alternative to manually setting up the symlinks to each repository, you can add a `repositories.local.json` file, and run the `build.local.sh` command.

For any local repositories you want to link to, use the full path to the repository on your local machine instead of the url to the github project. You can also mix these up with public respository urls for convenience.

```json
  {
    "/Users/username/code/Dolittle/DotNET.fundamentals/": {
        "name": "dotnet-fundamentals",
        "path": "api"
    },
    "https://github.com/dolittle-runtime/home.git": {
        "name": "overview",
        "path": "runtime"
    }
  }
```

## Building and running

### Install dependencies
You need to install node dependencies in the `Source/Hugo` folder. You can do this through using npm or yarn.

NPM:
```shell
$ npm install
```

Yarn:
```shell
$ yarn
```


### Install Hugo
You will need to [install Hugo](https://gohugo.io/getting-started/installing).
Once you have Hugo installed, you open a shell and navigate to the `Source/Hugo` folder.
From this you simply do:

Unix:
```shell
$ hugo server
```

Windows:
```shell
c:> hugo server
```
This should then yield something like the following:

```shell
                   | EN
+------------------+-----+
  Pages            | 191
  Paginator pages  |   0
  Non-page files   |  32
  Static files     | 209
  Processed images |   0
  Aliases          |   2
  Sitemaps         |   1
  Cleaned          |   0

Total in 149 ms
Watching for changes in /Users/einari/Projects/Dolittle/Documentation/Source/Hugo/{content,repositories,themes,..}
Watching for config changes in /Users/einari/Projects/Dolittle/Documentation/Source/Hugo/config.toml
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at //localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```

It is now a matter of opening up a browser to the URL `http://localhost:1313` and start writing documentation.
With the default option, the page will live reload when saving any files.

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/).
Markdown can be written using the simplest of editors (Pico, Nano, Notepad), but there are editors out there that gives
great value and guides you through giving you feedback on errors. Editors like [Visual Studio Code](http://code.visualstudio.com/)
and [Sublime Text](http://sublimetext.com) comes highly recommended. VSCode has for instance a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

{{< icon name="heart" size="large" >}}
{{% alert theme="success" %}}Happy documenting{{% /alert %}}
