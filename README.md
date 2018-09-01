# Documentation

Main documentation project

Flow:

- Match project
- If project has not been cloned, clone it
- Create a symbolic link to the Documentation folder within the project
- If project has been cloned, pull it
- Figure out what type of API documentation to generate
  - If C# - build project, run DocFX
- Run Hugo
- Upload static content to Blob storage
