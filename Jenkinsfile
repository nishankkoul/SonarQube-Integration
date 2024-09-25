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
        SONAR_URL = "https://sonar.bimaplan.co/"
        PROJECT_KEY = "nishankkoul_SonarQube-Integration_666b06b4-e5b6-426e-8184-54e9b1a8da33"
        GITHUB_REPO = "nishankkoul/SonarQube-Integration"
        SARIF_FILE = "sonar-results.sarif"
    }
    
    stages {
        stage("Git Checkout") {
            steps {
                git branch: 'main', url: "https://github.com/${GITHUB_REPO}.git"
            }
        }

        stage("Compile") {
            steps {
                sh "mvn clean compile"
            }
        }

        stage("Test") {
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
                    -Dsonar.java.binaries=target/classes \
                    -Dsonar.projectKey=$PROJECT_KEY \
                    -Dsonar.sources=src/main/java \
                    -Dsonar.login=$SONAR_AUTH_TOKEN \
                    -Dsonar.host.url=$SONAR_URL \
                    -Dsonar.java.libraries=target/dependency/*.jar \
                    -Dsonar.externalIssuesReportPaths=$SARIF_FILE \
                    -Dsonar.sarif.path=$SARIF_FILE
                    """
                }
            }
        }

        stage("Generate SARIF") {
            steps {
                script {
                    def sonarAnalysisId = sh(script: 'curl -s -u $SONAR_AUTH_TOKEN: "$SONAR_URL/api/ce/component?component=$PROJECT_KEY" | jq -r .current.analysisId', returnStdout: true).trim()
                    sh """
                    curl -o $SARIF_FILE -s -u $SONAR_AUTH_TOKEN: "$SONAR_URL/api/issues/export?projectKey=$PROJECT_KEY&statuses=OPEN,CONFIRMED&formats=sarif&sarifVersion=2.1.0&analysisId=$sonarAnalysisId"
                    """
                }
            }
        }

        stage("Upload SARIF to GitHub Code Scanning") {
            steps {
                script {
                    def commitSha = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
                    sh """
                    curl -X POST \
                    -H "Authorization: token $GITHUB_TOKEN" \
                    -H "Accept: application/vnd.github.v3+json" \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -F "commit_sha=$commitSha" \
                    -F "ref=refs/heads/main" \
                    -F "sarif=@$SARIF_FILE" \
                    https://api.github.com/repos/$GITHUB_REPO/code-scanning/sarifs
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