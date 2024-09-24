pipeline {
    agent any 
    
    tools {
        jdk 'jdk17'
        maven 'maven3'
        nodejs 'nodejs' // Use the NodeJS tool configured
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        GITHUB_TOKEN = credentials('github-token')
        SONAR_AUTH_TOKEN = credentials('SONAR_AUTH_TOKEN')
        SONAR_URL = "https://sonar.bimaplan.co/"
        PROJECT_KEY = "nishankkoul_SonarQube-Integration_666b06b4-e5b6-426e-8184-54e9b1a8da33"
        GITHUB_REPO = "nishankkoul/SonarQube-Integration"
    }
    
    stages {
        stage("Git Checkout") {
            steps {
                git branch: 'main', changelog: false, poll: false, url: "https://github.com/${GITHUB_REPO}.git"
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
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                    $SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectName=SonarQube-Integration \
                    -Dsonar.java.binaries=. \
                    -Dsonar.projectKey=$PROJECT_KEY \
                    -Dsonar.login=$SONAR_AUTH_TOKEN \
                    -Dsonar.host.url=$SONAR_URL
                    """
                }
            }
        }
        
        stage("Convert to SARIF and Upload") {
            steps {
                script {                
                    // Install necessary tools
                    sh 'npm install -g sonar-to-sarif'
                    
                    // Convert SonarQube issues to SARIF
                    sh """
                    sonar-to-sarif \
                        --url $SONAR_URL \
                        --token $SONAR_AUTH_TOKEN \
                        --project $PROJECT_KEY \
                        --output sonarqube-results.sarif
                    """
                    
                    // Upload SARIF to GitHub
                    def sarifContent = readFile('sonarqube-results.sarif')
                    def encodedSarif = sarifContent.bytes.encodeBase64().toString()
                    
                    sh """
                    curl -X POST \
                        -H "Authorization: token $GITHUB_TOKEN" \
                        -H "Accept: application/vnd.github.v3+json" \
                        https://api.github.com/repos/$GITHUB_REPO/code-scanning/sarifs \
                        -d '{
                            "commit_sha": "'"$GIT_COMMIT"'",
                            "ref": "refs/heads/main",
                            "sarif": "'"$encodedSarif"'"
                        }'
                    """
                }
            }
        }
    }
}
