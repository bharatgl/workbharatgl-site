#!/usr/bin/env bash
# One-time: let GitHub Actions (.github/workflows/deploy.yml) deploy this repo to GCP, keylessly.
# Creates a dedicated "portfolio-deployer" service account with only the roles a deploy needs, and a
# Workload Identity provider that trusts only bharatgl/workbharatgl-site on main. Safe to re-run.
# Usage: ./scripts/setup-ci-gcp.sh
set -euo pipefail
command -v gcloud >/dev/null || export PATH="$HOME/google-cloud-sdk/bin:$PATH"

PROJECT="${GCP_PROJECT_ID:-project-468f3f29-f3e4-4715-a6c}"
REPO="bharatgl/workbharatgl-site"
POOL="github"               # shared pool; ForgeFit has its own provider in it
PROVIDER="workbharatgl-site"
SA_NAME="portfolio-deployer"
SA="$SA_NAME@$PROJECT.iam.gserviceaccount.com"
NUM="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
RUNTIME_SA="$NUM-compute@developer.gserviceaccount.com" # what Cloud Run and its builds run as

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com --project "$PROJECT"

gcloud iam service-accounts describe "$SA" --project "$PROJECT" >/dev/null 2>&1 ||
  gcloud iam service-accounts create "$SA_NAME" --project "$PROJECT" --display-name "GitHub Actions: workbharatgl-site deploys"

# deploy from source, use the project's APIs, publish to Firebase Hosting
for role in roles/run.sourceDeveloper roles/serviceusage.serviceUsageConsumer roles/firebasehosting.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member "serviceAccount:$SA" --role "$role" --condition=None >/dev/null
  echo "› $SA_NAME has $role"
done
# start builds and revisions that run as the runtime account
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" --project "$PROJECT" \
  --member "serviceAccount:$SA" --role roles/iam.serviceAccountUser >/dev/null
echo "› $SA_NAME can act as $RUNTIME_SA"

# GitHub's OIDC tokens are accepted only from this repo's main branch
if ! gcloud iam workload-identity-pools providers describe "$PROVIDER" --location global \
  --workload-identity-pool "$POOL" --project "$PROJECT" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --project "$PROJECT" \
    --location global --workload-identity-pool "$POOL" --display-name "workbharatgl-site" \
    --issuer-uri "https://token.actions.githubusercontent.com" \
    --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition "assertion.repository == '$REPO' && assertion.ref == 'refs/heads/main'"
fi
gcloud iam service-accounts add-iam-policy-binding "$SA" --project "$PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/$NUM/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO" >/dev/null
echo "› GitHub runs from $REPO (main) can deploy as $SA_NAME"

echo
echo "Done. These must match .github/workflows/deploy.yml:"
echo "  WIF_PROVIDER: projects/$NUM/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"
echo "  DEPLOY_SA:    $SA"
