# Documentation
[![Netlify Status](https://api.netlify.com/api/v1/badges/dbad4963-107d-451b-bd0a-5ffcf63c65e5/deploy-status)](https://app.netlify.com/sites/dolittle-io/deploys)


## Cloning

This repository has sub modules, clone it with:

```shell
$ git clone --recursive <repository url>
```

If you've already cloned it, you can get the submodules by doing the following:

```shell
$ git submodule update --init --recursive
```

## Flow

- Match project
- If project has not been cloned, clone it
- Create a symbolic link to the Documentation folder within the project
  - Important: Link should be created based on version, so that we get a specific version of documentation outputted (BuildVersion)
- If project has been cloned, pull it
- Figure out what type of API documentation to generate
  - If C# - build project, run DocFX
- Run Hugo
- Upload static content to Blob storage
