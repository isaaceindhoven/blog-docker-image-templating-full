import fse from "fs-extra"
import nunjucks from "nunjucks"
import dotenv from "dotenv"
import { promisify } from "util"
import { default as rimrafCallback } from "rimraf"
import { phpPurple, dim, nodeGreen } from "./constants/colors.js"
import { prepare, render } from "./util/renderer.js"
import { write } from "./util/file.js"
import { Config } from "./Config.js"
import { Logger } from "./Logger.js"
import { base, builderBase, builder, outputFolder } from "./constants/variants.js"

// Load environment from .env file into process.env
dotenv.config()

const configFile = "config.json"
const outputIndexFile = outputFolder + "versions.json"

const rimraf = promisify(rimrafCallback)
const logger = new Logger()

/**
 * returns a Config utility class instance given a config file
 */
async function getConfig(configFile) {
  let configJson = await fse.readJson(configFile)

  if (process.env.REGISTRY_CONFIG_OVERWRITE) {
    configJson.registry = JSON.parse(process.env.REGISTRY_CONFIG_OVERWRITE)
  }

  return new Config(configJson)
}

/**
 * Writes a Dockerfile given a template and template context.
 *
 * @param template A compiled Nunjucks template
 * @param file The file path to write to
 * @param versions The version combination as context for the template, e.g. { php: "7.2", node: "10" }
 * @param context Any additional context for the template, e.g. { registry: "127.0.0.1" }
 * @return An object containing all the versions as well as the file that was created
 */
async function createDockerfile(template, file, versions, context) {
  const dockerfile = await render(template, { ...versions, ...context })
  await write(file, dockerfile)

  return {
    ...versions,
    file,
  }
}

/**
 * Logs the creation of a Dockerfile given a return object from the createDockerfile method
 */
function logCreatedDockerfile(created) {
  let output = dim(`Write "${created.file}"`)

  if (created.php) {
    output += " \t" + phpPurple(`PHP version ${created.php}`)
  }

  if (created.node) {
    output += " \t" + nodeGreen(`Node.js version ${created.node}`)
  }

  logger.success(output)

  // Return the input for chaining
  return created
}

/**
 * Creates a set of Dockerfiles given a template variant and a set of version combinations.
 *
 * @param variant A variant from the variants definition (src/constants/variants.js)
 * @param combinations A set of version combinations, e.g. [{ php: "7.2", node: "10" }, { php: "7.2", node: "12" }].
 *   Each combination is used to render it's own Dockerfile
 * @param additionalContext Any additional context to pass to each rendering of the Dockerfile
 */
async function createDockerfiles(variant, combinations, additionalContext) {
  const { templateFile, output, filenameTemplate, imageTemplate } = variant
  const template = await prepare(templateFile)

  // We'll create a promise for each combination and merge them for this function using Promise.all
  return Promise.all(
    combinations.map(versions => {
      // Use Nunjucks to render filename and image templates
      const context = { ...versions, ...additionalContext }
      const filename = nunjucks.renderString(filenameTemplate, context)
      const image = nunjucks.renderString(imageTemplate, context)
      const file = `${output}/${filename}`

      return (
        createDockerfile(template, file, versions, additionalContext)
          .then(logCreatedDockerfile)

          // Enrich the created object with the corresponding image
          .then(created => ({
            ...created,
            image,
          }))
      )
    })
  )
}

async function createVariantsDockerfiles(configFile) {
  // First we read the config and get all necessary version combinations
  const config = await getConfig(configFile)
  const phpVersions = config.getPhpVersions()
  const magentoPhpCombinations = config.getPhpNodeCombinations()
  const context = { registry: config.getRegistry() }
  logger.success("Read config")

  // Clean the output folder first, to start clean
  await rimraf(outputFolder + "*")
  logger.success("Clean output folder")

  const baseImages = await createDockerfiles(base, phpVersions, context)
  logger.success("Create base images")

  const builderBaseImages = await createDockerfiles(builderBase, magentoPhpCombinations, context)
  logger.success("Create Magento Builder base images")

  const builderImages = await createDockerfiles(builder, magentoPhpCombinations, context)
  logger.success("Create Magento Builder images")

  // We save all generated Dockerfiles to an output file
  const generated = { base: baseImages, builderBase: builderBaseImages, builder: builderImages }
  await fse.writeJson(outputIndexFile, generated, { spaces: 2 })
  logger.success(`Write "${outputIndexFile}" file with Dockerfile index`)
}

createVariantsDockerfiles(configFile)
  .then()
  .catch(error => logger.error(error))
