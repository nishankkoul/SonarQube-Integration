pipeline {
    agent any
    tools {
        jdk 'jdk17'
        maven 'maven3'
    }
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        GITHUB_TOKEN = credentials('github-token')
        SONAR_URL = "http://3.91.16.117:9000/" // Change this value depending on your VM's IP address
        REPO_URL = "https://github.com/nishankkoul/SonarQube-Integration.git"
    }
    stages {
        stage("Git Checkout") {
            steps {
                script {
                    def gitVars = checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: env.REPO_URL]]])
                    env.GIT_BRANCH = gitVars.GIT_BRANCH
                    env.GIT_COMMIT = gitVars.GIT_COMMIT
                    
                    // Extract repoName from REPO_URL
                    env.REPO_NAME = env.REPO_URL.tokenize('/')[-2..-1].join('/').replaceAll("\\.git\$", "")
                }
            }
        }
        stage("Compile") {
            steps {
                sh "mvn clean compile"
            }
        }
        stage("Test Cases"){
            steps {
                sh "mvn test"
            }
        }
        stage("Sonarqube Analysis") {
            steps {
                withSonarQubeEnv('sonar-server') {
                    script {
                        def sonarScanner = "${SCANNER_HOME}/bin/sonar-scanner"
                        def branchName = env.GIT_BRANCH.replaceAll("origin/", "")
                        
                        def sonarScannerParams = "-Dsonar.projectName=Petclinic " +
                                                 "-Dsonar.java.binaries=. " +
                                                 "-Dsonar.projectKey=Petclinic " +
                                                 "-Dsonar.login=${SONAR_AUTH_TOKEN} " +
                                                 "-Dsonar.host.url=${SONAR_URL} " +
                                                 "-Dsonar.github.oauth=${GITHUB_TOKEN} " +
                                                 "-Dsonar.github.repository=${env.REPO_NAME} "

                        if (env.CHANGE_ID) {
                            // Pull Request
                            sonarScannerParams += "-Dsonar.github.pullRequest=${env.CHANGE_ID} "
                        } else {
                            // Direct push
                            sonarScannerParams += "-Dsonar.branch.name=${branchName} "
                        }

                        sh "${sonarScanner} ${sonarScannerParams}"
                    }
                }
            }
        }
        stage("Quality Gate") {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
    post {
        always {
            script {
                def qg = waitForQualityGate()
                if (qg.status != 'OK') {
                    error "Quality gate failed: ${qg.status}"
                } else {
                    echo "Quality gate passed: ${qg.status}"
                }
                
                // Update GitHub commit status
                def ghStatus = (qg.status == 'OK') ? 'success' : 'failure'
                sh "curl -H 'Authorization: token ${GITHUB_TOKEN}' -X POST -d '{\"state\": \"${ghStatus}\", \"description\": \"SonarQube Quality Gate\", \"context\": \"continuous-integration/sonarqube\"}' https://api.github.com/repos/${env.REPO_NAME}/statuses/${env.GIT_COMMIT}"
            }
        }
    }
}