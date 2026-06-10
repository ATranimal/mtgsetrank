#!/bin/bash
# Uploads all card images from public/sets to an R2 bucket.
# Usage: ./scripts/upload_to_r2.sh <bucket-name>
# Example: ./scripts/upload_to_r2.sh mtgsetrank-images

BUCKET="${1:?Usage: $0 <bucket-name>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

find "$ROOT/public/sets" -type f -name "*.jpg" | while read -r file; do
  key="${file#$ROOT/public/}"
  echo "Uploading $key"
  wrangler r2 object put "$BUCKET/$key" --file "$file" --content-type "image/jpeg"
done

echo "Done."
