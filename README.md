> ⚠️ This is a repository accompanying [the "Dockerfile templating to automate image creation" article on ISAAC's developer blog](https://www.isaac.nl/nl/developer-blog/dockerfile-templating-to-automate-image-creation). It's archived because it's a redacted version of the version we use internally. You might find `<redacted>` statements throughout the repository of sensitive information we couldn't publish externally.

# Magento Image Generator

Project that automatically generates convenience images for the Magento 2 Builder (A project we use internally at ISAAC) for different versions of Magento 2, PHP and Node.js.

## Install

These images can be found at ISAAC's Docker image registry (\<URL to ISAAC's image registry redacted\>):

\<Image registry login procedure redacted \>

You'll see a list of all the images that are available:

- **`magento/base/php-7.x` | Magento 2 base images** - These images contain all Linux packages and PHP extensions that are needed to install and run Magento 2. It installs different packages and PHP extensions based on different PHP versions. The images do not include Magento itself.
- **`magento/builder-base/php-7.x/node-x` | Magento 2 builder base images** - These images contain all dependencies for installing the Magento 2 builder. It's based off of the Magento 2 base images, but also includes Node.js, hence the separation in PHP and Node.js versions.
- **`magento/builder/php-7.x/node-x` | Magento 2 builder images** - These images contain the Magento 2 builder. Everything is installed and the Magento 2 builder can be run through the `m2b` command inside the Docker container.

### Available images

Currently, the following PHP and Node.js combinations are available:

|             | Node.js 10.x | Node.js 12.x |
| ----------- | :----------: | :----------: |
| **PHP 7.0** |      ✔️      |      ✔️      |
| **PHP 7.1** |      ✔️      |      ✔️      |
| **PHP 7.2** |      ✔️      |      ✔️      |
| **PHP 7.3** |      ✔️      |      ✔️      |

You'll notice odd Node.js versions are not available. This is because uneven Node.js versions become unsupported after 6 months and will never become LTS. Therefore, they'll also never get any security updates after the next even release is out. Because of this we **strongly recommend against using uneven Node.js versions for builds or production deployments**.

We also don't have the current Node.js versions in there. We haven't found any use case for them, since most NPM packages just support the current LTS version. If you need the current Node.js version you can submit a pull request which adds it to the `config.json` file and adds it to the table above. You can also discuss your use case with the maintainers of this repository (Luud Janssen and Giel Berkers) because there might be another way.

## Usage

### Jenkins Pipeline

If you want to use these images in your Jenkins pipeline, you first have to set the Docker registry to ISAAC's image registry, then use a specific Docker image to run some commands:

```groovy
docker.withRegistry('\<URL to ISAAC\'s image registry redacted\>', '\<Credentials key redacted\>') {
  docker.image('\<URL to ISAAC\'s image registry redacted\>/magento/builder/php-7.3-node-12').inside() {
    sh('m2b deploy --auto --ignore-branch acceptance -vvv')
  }
}
```

> ⚠️ **We advice you pin the exact image versions.** These images are rebuild every day, which might cause unwanted updates between builds. We tag the images with both `latest` and timestamps, and we advice you to use the timestamp tags. You can find all images and their tags on our Docker image registry (\<URL to ISAAC's image registry redacted\>).

This example runs an acceptance deployment using the Magento 2 builder with PHP version 7.3 and Node.js version 12. It uses the `\<Credentials key redacted\>` credentials in the second argument of the `docker.withRegistry()` method which are available by default in ISAAC's Jenkins pipelines (\<URL to ISAAC's git remote redacted\>). If you want more details on how to use the Magento 2 builder, please check out the documentation on its repository (\<URL to ISAAC's Magento 2 builder source redacted\>).

### Local

You can also use these images for local development. For example, you can use the Magento builder image to install a Magento 2 project locally:

```shell
docker run --rm -it -v /${PWD}/app/project \<URL to ISAAC\'s image registry redacted\>/magento/builder/php-7.3/node-12 m2b install
```

This command mounts the current folder you're in with the `/app/project` folder and installs a new Magento 2 project in your current folder.

#### Enable Xdebug

For debugging during local development it might be helpful to enable Xdebug. It's bundled with the Docker images for images with PHP version >= 7.1, but it's not enabled by default. You can enable them by running the following command in the Docker container:

```bash
echo "zend_extension=/usr/local/lib/php/extensions/latest/xdebug.so" >> /usr/local/etc/php/conf.d/phpunit.ini
```

> Note: The `/usr/local/lib/php/extensions/latest` folder is a symlink to the actual `/usr/local/lib/php/extension/no-debug-non-zts-<xxx>` folder in which Xdebug and other extensions are installed.

## License

Proprietary license. See `LICENSE` file.

Copyright (c) 2020 [ISAAC Software Solutions B.V.](https://www.isaac.nl)
