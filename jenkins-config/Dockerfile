FROM 4oh4/jenkins-docker

USER root

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY jenkins.yaml /var/jenkins_home/jenkins.yaml

RUN chmod 777 /var/jenkins_home/jenkins.yaml

RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/ref/plugins.txt

ARG JAVA_OPTS
ENV JAVA_OPTS "-Djenkins.install.runSetupWizard=false ${JAVA_OPTS:-}"
