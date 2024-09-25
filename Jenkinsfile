pipeline {
    agent any
    
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        GITHUB_TOKEN = credentials('github-token')
        SONAR_URL = "https://sonar.bimaplan.co"
        PROJECT_KEY = "nishankkoul_SonarQube-Integration_97348d7f-60ff-44e0-a41c-402d64568bf8"
        GITHUB_REPO = "nishankkoul/SonarQube-Integration"
    }
    
    stages {
        stage("Git Checkout") {
            steps {
                git branch: 'main', url: "https://github.com/${GITHUB_REPO}.git"
            }
        }

        stage("Build and Test") {
            steps {
                sh "mvn clean install -DskipTests"
                sh "mvn dependency:copy-dependencies -DoutputDirectory=target/dependency"
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                    $SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectName=SonarQube-Integration \
                    -Dsonar.projectKey=$PROJECT_KEY \
                    -Dsonar.sources=src/main/java \
                    -Dsonar.java.binaries=target/classes \
                    -Dsonar.java.libraries=target/dependency/*.jar \
                    -Dsonar.host.url=$SONAR_URL
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
