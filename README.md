# getinvariant.sh

Static website for [Invariant Labs](https://github.com/invariant-sh), deployed with GitHub Pages.

## Local preview

Serve from this directory (needed so `demo.js` can fetch the JSON fixtures):

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173>. Product cards stay clean. The fail/hold tapes live under **Use cases** and load JSON from [`demo/`](./demo/).

## Evidence fixtures

The homepage two-column tape is local JSON shaped like Maul schema `0.2` and Holds schema `1`. It is not yet copied from GitHub Actions. Replace the files in `demo/` when CI publishing lands.

## Deployment

Pushes to `main` deploy through [the Pages workflow](./.github/workflows/pages.yml).
The custom domain is declared in [`CNAME`](./CNAME).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and the [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
Security reports: [`SECURITY.md`](./SECURITY.md).

Licensed under the [Apache License, Version 2.0](./LICENSE).
