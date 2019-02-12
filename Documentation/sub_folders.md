---
title: Managing Sub Folders & Repositories
description: Learn about how sub-folders can be used to structure the documentation from other repositories
keywords: Contributing
author: Dolittle
weight: 2
---
The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”,
“RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

The `content` folder is the base for all the content that is created for the documentation solution. The actual contents are pulled from the linked-to repositories as defined in `repositories.json`. It's also possible to build out a helper structure to aid with the linking and grouping of documentation across repositories.

## Structure

### Defining folder hierarchy
To add structure (sub-folders) to the content folder and make these visible, hugo expects an `index.md` available with a front-matter section that defines the title, description, keywords & relative weighting in its parent tree.

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

### Making structure deployable
By default the contents folder is ignored in the `.gitignore` file. This is to avoid including symlinks into the repository.
You have to manually add your newly added `_index.md` to git.

#### Manually add markdown files in `content` folder

**Run the following command from the `Source/Hugo` folder. Replace with your relevant path**
```bash
git add content/path/to/_index.md -f
```

#### Unignore markdown files in `.dockerignore`
If the supporting folder structure isn't in place, the cloning and linking of repositories will fail in the dockerizing process.
To avoid this, make sure to explicitly mark the relevant markdown or other static content file as included in `.dockerignore`

**Example of including a sub-folder called tools and its index**
```gitignore
!content/tools/_index.md
```

## Content from other repositories
The `build.js` task iterates over repositories defined in the `repositories.json` file, and gives them a matching name, and places the link in the relevant sub-folder in the `content` folder.

**Example of repositories.json**
```json
{
    "https://github.com/dolittle/home.git": {
        "name": "guidelines",
        "path": "contributing/where_to_start"
    },
    "https://github.com/dolittle/learning.git": {
        "name": "getting started",
        "path": ""
    }
}
```

**name**: Name of the folder that will be linked to
**path**: Path under content it will be placed

The above `repositories.json` will generate the following output. Note the `_index.md` files should already be in the `content` folder:

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
