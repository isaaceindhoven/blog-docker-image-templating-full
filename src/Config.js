import uniqBy from "lodash/uniqBy.js"

/**
 * Config utility class with some helpful methods to get version combinations
 */
export class Config {
  constructor(config) {
    this.config = config
  }

  getRegistry() {
    return this.config.registry.domain
  }

  /**
   * Returns all PHP versions that exist in the config and returns an array with unique values.
   */
  getPhpVersions() {
    const phpVersions = this.config.magento.versions.flatMap(({ php }) =>
      php.map(version => ({ php: version }))
    )
    return uniqBy(phpVersions, JSON.stringify)
  }

  /**
   * Returns the dot product of all Magento x PHP versions to get all valid combinations
   */
  getMagentoPhpCombinations() {
    return this.config.magento.versions.flatMap(magento =>
      magento.php.map(php => ({
        magento: magento.version,
        php,
      }))
    )
  }

  /**
   * Returns the dot product of all PHP x Node.js versions to get all valid combinations
   */
  getPhpNodeCombinations() {
    const combinations = this.config.magento.versions.flatMap(magento =>
      magento.php.flatMap(php => magento.node.flatMap(node => ({ node, php })))
    )

    return uniqBy(combinations, JSON.stringify)
  }
}
