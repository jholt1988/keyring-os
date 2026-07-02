#!/usr/bin/env bash
#
# CI guard: prevent client-supplied mock identity headers from being sent
# unconditionally (i.e. in production). The admin app authenticates via a real
# httpOnly-cookie proxy and must NOT reference these headers at all. Other apps
# (e.g. tenant-portal) may still carry a dev-only fail-closed stopgap, but ONLY
# if every reference to the mock headers is gated behind a strict dev guard.
#
# Rules enforced:
#   1. apps/admin/src must contain ZERO references to the mock identity headers.
#   2. Anywhere under apps/**/src that references X-Mock-User-Id / X-Mock-Role,
#      the same file MUST define the fail-closed gate:
#         process.env.NODE_ENV !== 'production'
#         && process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'
#      Without that gate, the headers are considered unconditional and FAIL.
#
# Exit 0 = pass, non-zero = fail.

set -euo pipefail

HEADER_PATTERN='X-Mock-User-Id\|X-Mock-Role'
fail=0

# --- Rule 1: admin must be completely free of mock headers -------------------
if grep -R "$HEADER_PATTERN" -n apps/admin/src 2>/dev/null; then
  echo "ERROR: mock identity headers found in apps/admin/src (must use the cookie proxy)." >&2
  fail=1
fi

# --- Rule 2: any other app referencing the headers must gate them ------------
# Collect the set of files (under any apps/**/src) that reference the headers.
mapfile -t files < <(grep -R "$HEADER_PATTERN" -l apps/*/src 2>/dev/null \
  | grep -v '^apps/admin/src' || true)

for f in "${files[@]}"; do
  [ -z "$f" ] && continue
  # The file must define the strict fail-closed gate.
  if grep -q "NODE_ENV !== 'production'" "$f" \
     && grep -q "NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'" "$f"; then
    echo "OK (gated dev-only stopgap): $f" >&2
  else
    echo "ERROR: $f references mock identity headers without the required" >&2
    echo "       fail-closed gate (NODE_ENV !== 'production' &&" >&2
    echo "       NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'). Refusing." >&2
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "check:no-mock-auth FAILED" >&2
  exit 1
fi

echo "check:no-mock-auth passed" >&2
exit 0
