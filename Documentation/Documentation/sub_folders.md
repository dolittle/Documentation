---
title: Managing Sub Folders & Repositories
description: Learn about how sub-folders can be used to structure the documentation from other repositories
keywords: Contributing
author: Dolittle
weight: 3
---

The `content` folder is the base for all the content that is created for the documentation solution. The actual contents are added to `Documentation/Source/repositories/` using submodules, then added to the `content` folder using symlinks.

## Structure

### Defining folder hierarchy

To add structure (sub-folders) to the content folder and make these visible, hugo expects an `_index.md` available with a front-matter section that defines the title, description, keywords & relative weighting in its parent tree.

Note! Only use lower cased folder names.

```markdown
---
title: Page Title
description: A short description of the pages contents
keywords: comma, separated, keywords, to, help, searching
author: authorname
weight: 2
---
```

## Content from other repositories

{{% notice info %}} When linking to a repository for the first time, make sure the `Documentation` folder exists, otherwise the symlink will fail, and the solution won't pick up any documentation changes from that repository. Redeploy when the folder exists.{{% /notice %}}

To link to documentation from another repository, add that repository to the documentation repo as a submodule. The repository should have a folder named `Documentation` at its root with its documentation written in markdown.

Then add a symlink from the content folder to the `Documentation` folder in the repository.

[Read how to handle submodules and symlinks here](../getting_started)

```bash
content
|---_index.md
|---getting started [linked to home/Documentation]
|---contributing
    |---_index.md
    |---where_to_start
        |---_index.md
        |---guidelines [linked to learning/Documentation]
```
