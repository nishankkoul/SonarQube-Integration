pipeline {
    agent any 
    
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    
    stages {
        
        stage("Git Checkout") {
            steps {
                git branch: 'main', changelog: false, poll: false, url: 'https://github.com/nishankkoul/SonarQube-Integration.git'
            }
        }
        
        stage("Compile") {
            steps {
                sh "mvn clean compile"
            }
        }

        

        stage("Test Cases"){
            steps{
                sh "mvn test"
            }
        }
        
        stage("Sonarqube Analysis") {
            environment {
                SONAR_URL = "https://sonar.bimaplan.co/" // Change this value depending on your VM's IP address
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectName=Petclinic \
                    -Dsonar.java.binaries=. \
                    -Dsonar.projectKey=Petclinic \
                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                    -Dsonar.host.url=${SONAR_URL}'''
                }
            }
        }
    }
}

