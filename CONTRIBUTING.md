# Contributing

If you simply need to add / remove a Magento, PHP or Node.js version you can make a change to the `config.json` file in the root of this project. For each Magento 2.x version it's defined what PHP versions it supports and what Node.js versions the Magento 2 builder should use.

If you need to make changes to the Dockerfile templates, the Jenkins pipeline or the Node.js source, you'll have to go through the setup.

## Setup

Developing for this project can be a little tricky as you'll need a local Jenkins and Docker registry instance. The local development setup was made by Luud Janssen (\<e-mail to main contributor redacted, contact via https://github.com/luudjanssen\>), so he can help you set everything up.

### Docker Compose

To help with local development, this project contains a `docker-compose.yml` file that can be used to start the following services locally:

- [`localhost:8081`](http://localhost:8081) - **Jenkins with Docker** Runs jenkins locally with the ability to execute Docker commands in your Jenkinsfiles
- [`localhost`](http://localhost) - **Docker registry** Runs a Docker image registry locally, mimmicking ISAAC's Docker image registry
- [`localhost:8082`](http://localhost:8082) - **Docker registry UI** A simple UI that connects with your local image registry and shows you all the images that were pushed to the local registry

You can run all these applications if you have Docker installed by running `docker-compose -d` in the root of this repository. You can shut them down by running `docker-compose down`. Be sure to stop all services running on any of the ports that these services use before starting with Docker Compose to avoid port conflicts.

[_More information on Docker Compose_](https://docs.docker.com/compose/)

### Config

This project uses environment variables to set the configuration for local development. All environment variables have to be stored in the `.env` file. You can copy the `.env.example` file and rename the copy to `.env`.

In your new `.env` file you can edit the following variables:

- `JENKINS_ADMIN_PASSWORD` - This can be any password for your local Jenkins instance's admin account.
- `JENKINS_PIPELINE_BRANCH` - The branch of this repository the Jenkins pipeline needs to be based upon. This will probably the current branch you're working on, so a `feature/XXXXX` or `username/XXXXX` branch.
- `GIT_USERNAME` - The Git username for which the Personal Access Token was created.
- `GIT_PERSONAL_ACCESS_TOKEN` - Your Git Personal Access Token. See "Git Credentials" for more information.
- `GIT_REPOSITORY` - The Git repository Jenkins can pull from and has access to through the Personal Access Token. You can probably use the default value, which is this repository.
- `REGISTRY_CONFIG_OVERWRITE` - An overwrite (in JSON) of the `registry` property of the `config.json` file. This will make you able to point any Docker push and pull commands to your local registry. For local development you can probably use the default value, which points to the same configuration as the default `docker-compose.yml` configuration.

### Git Credentials

You'll have to give your local Jenkins instance access to Git in order to get access to the pipeline. You can do this by creating a Personal Access Token (PAT). The PAT you create only needs `read` access.

### Jenkins Configuration

We use [Jenkins' Configuration as Code plugin](https://github.com/jenkinsci/configuration-as-code-plugin) to setup your local Jenkins instance without any manual changes, so everything should run out of the box given you've set the environment variables in your `.env` file correctly.

Note that if you make any changes to the environment variables you need to run `docker-compose down && docker-compose up -d` or `docker-compose restart` to restart all services.

### Node.js

If you want to test the creation of the Dockerfiles without running the whole Jenkins pipeline, you can install Node.js and run that process locally.

Make sure you install the Node.js version defined in the `.nvmrc` file.

You can install Node.js [from their website](https://nodejs.org/en/) or by using Node Version Manager ([Linux / OS X](https://github.com/nvm-sh/nvm) - [Windows](https://github.com/coreybutler/nvm-windows)) and installing the right version by running:

```shell
nvm install $(cat .nvmrc) && nvm use $(cat .nvmrc).
```

After you've installed Node.js you have to install its dependencies by running `npm install`. The node process will use the values from the `.env` file you created.

### Magento builder source containers

A couple of images require the Magento builder source image (\<URL to magento builder images redacted\>) to be able to build. To resolve this, you can pull the Magento 2 builder repository (\<URL to magento builder source redacted\>) and build the images yourself.

> At the time of writing, only the `develop` branch contains the Dockerfile necessary to build

```bash
git clone "<Git URL to magento builder source redacted>"
cd magento2-builder
git checkout develop
docker build -t 127.0.0.1/magento/builder-source:latest .
docker push 127.0.0.1/magento/builder-source:latest
```

## Codebase

This project consists of two main parts:

- A Node.js project in the `src` folder that is used to render the templates in `src/templates` to a large set of Dockerfiles for each configuration combination.
- A Jenkins pipeline in the `Jenkinsfile` that reads the generated Dockerfiles from `output/versions.json`, builds them and pushes them to the Docker registry.

You can run the generation of the Dockerfiles separately from the Jenkins pipeline by running `npm start` (if you've got Node.js installed). This will create all Dockerfiles in the `output` folder, as well as creating the `output/versions.json` file which describes all generated files.

---

Thanks for contributing and good luck!
