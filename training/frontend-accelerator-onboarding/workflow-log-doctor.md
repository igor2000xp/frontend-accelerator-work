node ./toolchain/bin/doctor.mjs --json

{
  "status": "DEGRADED",
  "checks": [
    {
      "id": "git-root",
      "status": "PASS",
      "message": "Git root: /Volumes/MAC_DOCS/repos/AI-Innowise/frontend-accelerator-work"
    },
    {
      "id": "node",
      "status": "PASS",
      "message": "Node.js 24.18.0 satisfies the accelerator requirement."
    },
    {
      "id": "manifest",
      "status": "PASS",
      "message": "Runtime Toolchain Manifest 7e9501102f9b is valid."
    },
    {
      "id": "capability:browser",
      "status": "PASS",
      "message": "browser capability agent-browser@0.32.3 is ready."
    },
    {
      "id": "capability:docs",
      "status": "PASS",
      "message": "docs capability ctx7@0.5.5 is ready."
    },
    {
      "id": "hooks:claude",
      "status": "PASS",
      "message": "claude hooks: ACTIVE",
      "details": {
        "status": "ACTIVE",
        "proofPath": "/Users/igor/Library/Caches/frontend-accelerator/activation/2ee94527b36f33f21a9ca8409aff139d8e9a176ee7e18edf55c2391e3bcd8e84/claude.json",
        "activatedAt": "2026-09-01T14:02:43.678Z"
      }
    },
    {
      "id": "hooks:codex",
      "status": "DEGRADED",
      "message": "codex hooks: PENDING_ACTIVATION",
      "details": {
        "status": "PENDING_ACTIVATION",
        "proofPath": "/Users/igor/Library/Caches/frontend-accelerator/activation/2ee94527b36f33f21a9ca8409aff139d8e9a176ee7e18edf55c2391e3bcd8e84/codex.json"
      }
    },
    {
      "id": "lint",
      "status": "DEGRADED",
      "message": "Changed-File Lint Gate is degraded: no existing lint script was found.",
      "details": {
        "status": "missing",
        "reason": "no existing lint script was found"
      }
    }
  ],
  "targetRoot": "/Volumes/MAC_DOCS/repos/AI-Innowise/frontend-accelerator-work",
  "cacheRoot": "/Users/igor/Library/Caches/frontend-accelerator",
  "manifestHash": "7e9501102f9b17fee2894cb4fac2c39f989835ee4518f31cfa38075d57c72f79"
}
