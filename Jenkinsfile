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

        stage("Generate SARIF") {
            steps {
                script {
                    def encodedProjectKey = URLEncoder.encode(PROJECT_KEY, "UTF-8")
                    withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'SONAR_AUTH_TOKEN')]) {
                        def sonarAnalysisId = sh(script: """
                            curl -s -u \${SONAR_AUTH_TOKEN}: "${SONAR_URL}/api/ce/component?component=${encodedProjectKey}" | jq -r '.current.analysisId'
                        """, returnStdout: true).trim()
                        
                        echo "Retrieved SonarQube Analysis ID: ${sonarAnalysisId}"  // Debugging line

                        if (sonarAnalysisId && sonarAnalysisId != "null") {
                            echo "Analysis ID: ${sonarAnalysisId}"
                            sh """
                            curl -o ${SARIF_FILE} -s -u \${SONAR_AUTH_TOKEN}: "${SONAR_URL}/api/issues/export?projectKey=${encodedProjectKey}&statuses=OPEN,CONFIRMED&formats=sarif&sarifVersion=2.1.0&analysisId=${sonarAnalysisId}"
                            """
                        } else {
                            error "Failed to retrieve SonarQube analysis ID"
                        }
                    }
                }
            }
        }

        stage("Upload SARIF to GitHub Code Scanning") {
            steps {
                script {
                    def commitSha = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
                    echo "Commit SHA: ${commitSha}"  // Debugging line
                    withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                        sh """
                        curl -X POST \
                        -H "Authorization: token \${GITHUB_TOKEN}" \
                        -H "Accept: application/vnd.github.v3+json" \
                        -F "commit_sha=${commitSha}" \
                        -F "ref=refs/heads/main" \
                        -F "sarif=@${SARIF_FILE}" \
                        https://api.github.com/repos/${GITHUB_REPO}/code-scanning/sarifs
                        """
                    }
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
