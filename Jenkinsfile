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
        SARIF_FILE = "results.sarif" // Specify the SARIF output file
    }
    
    stages {
        stage("Git Checkout") {
            steps {
                git branch: 'main', changelog: false, poll: false, url: "https://github.com/${GITHUB_REPO}.git"
            }
        }
        
        stage("Install Dependencies") {
            steps {
                sh "npm install" // Install npm packages including ESLint
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
        
        stage("Run ESLint to Generate SARIF") {
            steps {
                sh """
                npx eslint . --format sarif --output-file ${SARIF_FILE}
                """
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
                    -Dsonar.host.url=$SONAR_URL \
                    -Dsonar.sarifReportPaths=$SARIF_FILE
                    """
                }
            }
        }

        stage("Upload SARIF to GitHub Code Scanning") {
            steps {
                script {
                    // Use the GitHub API to upload the SARIF file
                    def commitSha = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
                    sh """
                    curl -X POST https://api.github.com/repos/$GITHUB_REPO/code-scanning/sarifs \
                    -H "Authorization: token $GITHUB_TOKEN" \
                    -H "Accept: application/vnd.github.v3+json" \
                    -F "commit_sha=$commitSha" \
                    -F "ref=refs/heads/main" \
                    -F "sarif=@$SARIF_FILE"
                    """
                }
            }
        }
    }
}
