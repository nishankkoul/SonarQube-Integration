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
                SONAR_URL = "http://<SonarQube-URL>:9000/" // Use your SonarQube VM IP address here
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectKey=Petclinic \
                    -Dsonar.java.binaries=. \
                    -Dsonar.projectName=Petclinic \
                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                    -Dsonar.host.url=${SONAR_URL} \
                    -Dsonar.pullrequest.key=${env.CHANGE_ID} \
                    -Dsonar.pullrequest.branch=${env.CHANGE_BRANCH} \
                    -Dsonar.pullrequest.base=${env.CHANGE_TARGET} \
                    -Dsonar.pullrequest.provider=GitHub'''
                }
            }
        }
        
        stage("Post Analysis") {
            steps {
                script {
                    // Fetch the SonarQube Quality Gate Status
                    def sonarStatus = sh(script: 'curl -u ${SONAR_AUTH_TOKEN}: ${SONAR_URL}/api/qualitygates/project_status?projectKey=Petclinic', returnStdout: true).trim()
                    
                    if (sonarStatus.contains('"status":"ERROR"')) {
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }
    }
}
