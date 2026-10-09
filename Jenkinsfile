// Yantra CI/CD: check -> build Docker image -> smoke test -> push -> deploy to Kubernetes.
//
// Jenkins agent needs: docker, kubectl (and a Linux shell).
// Jenkins credentials to create (Manage Jenkins -> Credentials):
//   - "docker-registry" : Username with password for your registry (e.g. Docker Hub user + access token)
//   - "kubeconfig"      : Secret file containing the kubeconfig for the target cluster
pipeline {
  agent any

  parameters {
    string(name: 'REGISTRY', defaultValue: '', description: 'Registry host + namespace, e.g. docker.io/yourname or ghcr.io/yourname. Leave empty to build locally without pushing.')
    booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy to Kubernetes after a successful build')
  }

  environment {
    APP = 'yantra-web'
    TAG = "${env.BUILD_NUMBER}"
    IMAGE = "${params.REGISTRY ? params.REGISTRY + '/' : ''}yantra-web"
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh 'docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .'
        // Syntax-check the JavaScript inside the image we just built.
        sh '''
          docker run --rm "$IMAGE:$TAG" sh -c '
            node --check backend/server.js &&
            for f in frontend/auth.js frontend/brand.js frontend/ui.js frontend/firebase-config.js; do
              cp "$f" /tmp/check.mjs && node --check /tmp/check.mjs || exit 1
            done'
        '''
      }
    }

    stage('Smoke test') {
      steps {
        sh '''
          docker run -d --name "$APP-ci-$TAG" "$IMAGE:$TAG"
          for i in $(seq 1 15); do
            if docker exec "$APP-ci-$TAG" wget -qO- http://127.0.0.1:5500/healthz | grep -q ok \
               && docker exec "$APP-ci-$TAG" wget -qO- http://127.0.0.1:5500/ | grep -q "<title>Yantra"; then
              echo "Smoke test passed"; exit 0
            fi
            sleep 2
          done
          echo "Smoke test failed"; docker logs "$APP-ci-$TAG"; exit 1
        '''
      }
      post {
        always {
          sh 'docker rm -f "$APP-ci-$TAG" || true'
        }
      }
    }

    stage('Push image') {
      when { expression { params.REGISTRY?.trim() } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh '''
            echo "$REG_PASS" | docker login "${REGISTRY%%/*}" -u "$REG_USER" --password-stdin
            docker push "$IMAGE:$TAG"
            docker push "$IMAGE:latest"
          '''
        }
      }
      post {
        always {
          sh 'docker logout "${REGISTRY%%/*}" || true'
        }
      }
    }

    stage('Deploy to Kubernetes') {
      when { expression { params.DEPLOY } }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            kubectl apply -f k8s/namespace.yaml
            kubectl apply -f k8s/service.yaml
            # Deploy the exact image this build produced.
            sed "s#image: yantra-web:latest#image: $IMAGE:$TAG#" k8s/deployment.yaml | kubectl apply -f -
            kubectl -n yantra rollout status deployment/$APP --timeout=120s
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Built ${env.IMAGE}:${env.TAG}"
    }
    failure {
      echo 'Pipeline failed. Check the stage logs above.'
    }
  }
}
