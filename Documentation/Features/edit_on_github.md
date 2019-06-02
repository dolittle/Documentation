---
title: Edit on Github 
description: Learn about how sub-folders can be used to structure the documentation from other repositories
keywords: Contributing
---

A practical feature is the ability to go directly from a page in the documentation and make changes on GitHub. Doing so requires the linked repository to have the repository url defined in its base `_index.md`.

## How to enable "Edit on Github" for your repository

To enable support for "Edit on Github" button on a page, the top level `_index.md` in that repositories `Documentation`-folder needs to have a reference to the repository in the front matter.

{{% notice note %}}
Do not include a trailing slash at the end of the repository URL.
{{% /notice %}}

An example of front-matter with repository set:
```markdown
---
...
...
repository: https://github.com/dolittle/Documentation
---

```

All sub-articles will use this repository as the base for the links generated to edit files on GitHub.

## If no repository is defined

If there isn't a `repository` front matter defined no edit-button will be shown.