#!/usr/bin/env bash
# Deploy workbharatgl.online to GCP:
#   Cloud Run (asia-south1)  -> /api/* (Gemini Live tokens, text answers), key from Secret Manager
#   Firebase Hosting (CDN)   -> the site itself, custom domain + HTTPS, forwards /api/* to Cloud Run
#
# One-time: install the Google Cloud CLI, then run `gcloud auth login`.
# Usage:    GCP_PROJECT_ID=your-project-id ./scripts/deploy-gcp.sh
set -euo pipefail

PROJECT="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID to your GCP project id}"
REGION="${GCP_REGION:-asia-south1}" # must match the region in firebase.json
SERVICE="workbharatgl-site"
# own npm cache: a ~/.npm with root-owned files (from an old `sudo npm`) can't break the deploy
export npm_config_cache="${npm_config_cache:-$HOME/.cache/npm-deploy}"
FIREBASE="npx --yes firebase-tools@15.32.1"
cd "$(dirname "$0")/.."

echo "› project $PROJECT, region $REGION"
gcloud config set project "$PROJECT" >/dev/null
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com firebasehosting.googleapis.com firebase.googleapis.com

# Copy a key from .env into Secret Manager without ever printing it. Skips keys that are missing or already stored.
store_secret() { # <ENV_NAME> <secret-name>
  local value
  value="$(grep -E "^[[:space:]]*$1[[:space:]]*=" .env 2>/dev/null | head -1 | sed -E 's/^[^=]*=[[:space:]]*//; s/^["'\'']//; s/["'\'']?[[:space:]]*$//')" || true
  if gcloud secrets describe "$2" >/dev/null 2>&1; then echo "› secret $2 already exists (kept)"; return 0; fi
  if [ -z "$value" ]; then echo "› $1 not in .env, skipped"; return 1; fi
  printf '%s' "$value" | gcloud secrets create "$2" --data-file=- --replication-policy=automatic >/dev/null
  echo "› stored $1 in Secret Manager as $2"
}

SECRETS="GEMINI_API_KEY=gemini-api-key:latest"
store_secret GEMINI_API_KEY gemini-api-key
if store_secret ANTHROPIC_API_KEY anthropic-api-key; then SECRETS="$SECRETS,ANTHROPIC_API_KEY=anthropic-api-key:latest"; fi

# Cloud Run's default runtime account needs to read those secrets.
RUNTIME_SA="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
for s in gemini-api-key anthropic-api-key; do
  gcloud secrets describe "$s" >/dev/null 2>&1 &&
    gcloud secrets add-iam-policy-binding "$s" --member="serviceAccount:$RUNTIME_SA" \
      --role=roles/secretmanager.secretAccessor >/dev/null
done

# Newer projects build with the default compute account, which can't read uploaded sources until it has
# the Cloud Run Builder role (source read, image + log write). Idempotent.
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$RUNTIME_SA" \
  --role=roles/run.builder --condition=None >/dev/null

echo "› building and deploying Cloud Run service $SERVICE"
# max-instances caps cost if traffic (or abuse) spikes; min-instances 0 means it costs nothing when idle
gcloud run deploy "$SERVICE" --source . --region "$REGION" --allow-unauthenticated --quiet \
  --set-secrets "$SECRETS" --memory 512Mi --cpu 1 --concurrency 80 \
  --min-instances 0 --max-instances 5 --timeout 60

echo "› deploying the site to Firebase Hosting"
$FIREBASE projects:addfirebase "$PROJECT" >/dev/null 2>&1 || true # no-op if Firebase is already on the project
npm ci
npm run build
$FIREBASE deploy --only hosting --project "$PROJECT"

echo
echo "Done. Next, once: Firebase console → Hosting → Add custom domain → workbharatgl.online (and www),"
echo "then add the DNS records it shows at your domain registrar. HTTPS is issued automatically."
