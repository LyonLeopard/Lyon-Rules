# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository serves two purposes:
1. **Rule Set Management**: Maintains domain routing rules (`direct.txt`, `proxy.txt`) via Git version control
2. **Proxy Configuration Deployment**: Manages Surge, Stash, and Mihomo proxy client configurations that are deployed to Alibaba Cloud OSS (not tracked in Git)

## Architecture

### Rule Sets (Version Controlled)

- **direct.txt**: Domain rules for direct connections, supporting:
  - `DOMAIN-SUFFIX`: Match domain and all subdomains (e.g., `DOMAIN-SUFFIX,sparkingcd.com`)
  - `DOMAIN`: Exact domain match (e.g., `DOMAIN,casa.lyonyu.dev`)
- **proxy.txt**: Domain rules for proxy routing (same format as direct.txt)

These files are tracked in Git and form the core version-controlled configuration.

### Proxy Configurations (Not in Git)

The `profiles/` directory contains client-specific configurations that are **excluded from Git** but deployed to OSS:
- `surge-*`: Surge proxy client configurations
- `stash-*.yaml`: Stash proxy client YAML configurations
- Mihomo configurations

Profile variants:
- Personal: `surge-lyon`, `stash-lyon.yaml`
- Shared: `surge-share`, `stash-share.yaml`
- Organization: `surge-strikingly-partners`

### Deployment Script

**deployoss.js**: Uploads proxy configuration files from `profiles/` to Alibaba Cloud OSS using the `ali-oss` SDK.

## Development Workflow

### Managing Rule Sets

Edit rule files directly:
- [direct.txt](direct.txt): Add domains that should bypass proxy
- [proxy.txt](proxy.txt): Add domains that require proxy

Commit changes:
```bash
git add direct.txt proxy.txt
git commit -m "Update routing rules"
git push
```

### Deploying Proxy Configurations

1. **Setup Environment Variables**:
   ```bash
   export OSS_ACCESS_KEY_ID=your_access_key
   export OSS_ACCESS_KEY_SECRET=your_secret_key
   ```

2. **Configure deployoss.js** (first time only):
   - Line 6: Set `region` to your OSS bucket region (e.g., `oss-cn-hangzhou`)
   - Line 12: Set `bucket` to your bucket name
   - Line 33: Update OSS destination path and local source file path

3. **Deploy to OSS**:
   ```bash
   node deployoss.js
   ```

### Installation

```bash
pnpm install
```

## Important Notes

- **Git Tracking**: Only rule sets (`.txt` files) and deployment scripts are version controlled. Profile configurations in `profiles/` should remain in `.gitignore`.
- **Security**: Never commit OSS credentials. Always use environment variables for authentication.
- **Deployment Safety**: The script is configured with `x-oss-forbid-overwrite: true` to prevent accidentally overwriting existing configurations.
- **Rule Format**: Both direct.txt and proxy.txt use the same domain rule syntax (DOMAIN-SUFFIX, DOMAIN).
