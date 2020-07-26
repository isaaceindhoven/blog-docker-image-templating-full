export const templateFolder = "src/templates/"
export const outputFolder = "output/"

/**
 * The base variant is used to create Docker images containing all dependencies
 * for installing and running Magento except for Magento or the Magento builder itself
 */
export const base = {
  templateFile: templateFolder + "base.Dockerfile.njk",
  output: outputFolder + "base",
  filenameTemplate: "php-{{ php }}.Dockerfile",
  imageTemplate: "{{ registry }}/magento/base/php-{{ php }}",
}

/**
 * The builder base variant is used to create Docker images containing everything
 * that's necessary to run the Magento builder, but does not include the builder itself
 */
export const builderBase = {
  templateFile: templateFolder + "builder-base.Dockerfile.njk",
  output: outputFolder + "builder-base",
  filenameTemplate: "php-{{ php }}/node-{{ node }}.Dockerfile",
  imageTemplate: "{{ registry }}/magento/builder-base/php-{{ php }}/node-{{ node }}",
}

/**
 * The builder variant is used to create Docker images containing the Magento builder
 */
export const builder = {
  templateFile: templateFolder + "builder.Dockerfile.njk",
  output: outputFolder + "builder",
  filenameTemplate: "php-{{ php }}/node-{{ node }}.Dockerfile",
  imageTemplate: "{{ registry }}/magento/builder/php-{{ php }}/node-{{ node }}",
}
