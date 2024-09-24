pipeline {
    agent any 
    
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        GITHUB_TOKEN = credentials('github-token')
        SONAR_AUTH_TOKEN = credentials('SONAR_AUTH_TOKEN')
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

        stage("Test Cases") {
            steps {
                sh "mvn test"
            }
        }
        
        stage("SonarQube Analysis") {
            environment {
                SONAR_URL = "https://sonar.bimaplan.co/"
            }
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectName=SonarQube-Integration \
                    -Dsonar.java.binaries=. \
                    -Dsonar.projectKey=nishankkoul_SonarQube-Integration_666b06b4-e5b6-426e-8184-54e9b1a8da33 \
                    -Dsonar.login=${SONAR_AUTH_TOKEN} \
                    -Dsonar.host.url=${SONAR_URL}'''
                }
            }
        }
        
        stage("Convert to SARIF and Upload") {
            steps {
                script {
                    // Wait for SonarQube analysis to complete
                    timeout(time: 1, unit: 'HOURS') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to quality gate failure: ${qg.status}"
                        }
                    }
                    
                    // Install necessary tools
                    sh 'npm install -g sonar-to-sarif'
                    
                    // Convert SonarQube issues to SARIF
                    withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'SONAR_AUTH_TOKEN')]) {
                        sh """
                        sonar-to-sarif \
                            --url ${SONAR_URL} \
                            --token ${SONAR_AUTH_TOKEN} \
                            --project nishankkoul_SonarQube-Integration_666b06b4-e5b6-426e-8184-54e9b1a8da33 \
                            --output sonarqube-results.sarif
                        """
                    }
                    
                    // Upload SARIF to GitHub
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh """
                        curl -X POST \
                            -H "Authorization: token ${GITHUB_TOKEN}" \
                            -H "Accept: application/vnd.github.v3+json" \
                            https://api.github.com/repos/nishankkoul/SonarQube-Integration/code-scanning/sarifs \
                            -d '{
                                "commit_sha": "'${GIT_COMMIT}'",
                                "ref": "refs/heads/main",
                                "sarif": "'$(base64 -w 0 sonarqube-results.sarif)'"
                            }'
                        """
                    }
                }
            }
        }
    }
}