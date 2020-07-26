def nodeVersion
def config

// Define the build function that returns a Docker build task that can be run in parallel
def build(def version) {
    def now = new Date()
    def datetime = now.format("yyyy-MM-dd'T'HH-mm-ss")

    // Tag with the date and "latest"
    def tags = [
        datetime,
        "latest"
    ]

    // Make sure we allways use the latest container image
    def image = docker.build(version.image, "--pull -f ./${ version.file } .")

    // Push all tags
    tags.each { tag -> 
        image.push(tag)
    }
}

pipeline {
    agent any

    options {
        // Discard old builds and artifacts
        buildDiscarder(logRotator(daysToKeepStr: '150', numToKeepStr: '30', artifactDaysToKeepStr: '30', artifactNumToKeepStr: '15'))

        // We perform our own checkout steps
        skipDefaultCheckout(true)

        // Prevent builds from running concurrently
        disableConcurrentBuilds()

        // Cancel build after 30 minutes
        timeout(time: 30, unit: 'MINUTES')

        // Support ANSI colors
        ansiColor('xterm')
    }

    triggers {
        cron('@midnight')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    deleteDir()
                    checkout(scm)
                }
            }
        }

        stage('Node version') {
            steps {
                script {
                    // Read the Node.js version from the ".nvmrc" file
                    nodeVersion = readFile(".nvmrc")

                    // Remove the "v" prefix, if present
                    nodeVersion = nodeVersion.replaceAll('v', '')

                    // Remove any whitespace if present
                    nodeVersion = nodeVersion.replaceAll('\\s', '')
                }
            }
        }

        stage('Config') {
            steps {
                script {
                    config = readJSON(file: 'config.json')
                    registryOverwrite = env.REGISTRY_CONFIG_OVERWRITE

                    if (registryOverwrite) {
                        config.registry = readJSON(text: registryOverwrite)
                    }
                }
            }
        }

        stage('Create Dockerfiles') {
            steps {
                script {
                    // Run the NPM script in a Node.js Docker container with the same version as the .nvmrc file. Ensure we run commands as "jenkins" user and mount directories
                    sh('mkdir -p ${WORKSPACE}/.home ${WORKSPACE}/.home/.npm')
                    docker
                        .image("node:${ nodeVersion }")
                        .inside(
                            (env.REGISTRY_CONFIG_OVERWRITE ? "-e 'REGISTRY_CONFIG_OVERWRITE=${env.REGISTRY_CONFIG_OVERWRITE}'" : "") + """
                            -v /etc/passwd:/etc/passwd:ro
                            -v /etc/group:/etc/group:ro
                            -v \${WORKSPACE}/.home:/home/jenkins
                            -v \${WORKSPACE}/.home/.npm:/home/jenkins/.npm
                            --entrypoint=''
                        """) {
                            sh('npm ci')
                            sh('npm start')
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {    
                    // Get the registry URL from the registry definition in the config
                    def registry = "http${ config.registry.https ? 's' : '' }://${ config.registry.domain }"

                    docker.withRegistry(registry, config.registry.credentials) {

                        // Read the needed image versions from the generated versions.json file
                        def versions = readJSON(file: 'output/versions.json')

                        // For the base, builderBase and builder variants, create a build task for each version combination
                        def baseVersions = versions.base
                        def baseBuildTasks = [:]
                        def builderBaseVersions = versions.builderBase
                        def builderBaseBuildTasks = [:]
                        def builderVersions = versions.builder
                        def builderBuildTasks = [:]

                        baseVersions.each { version -> 
                            build(version)
                        }

                        builderBaseVersions.each { version -> 
                            build(version)
                        }

                        builderVersions.each { version -> 
                            build(version)
                        }
                    }
                }
            }
        }
    }
}
