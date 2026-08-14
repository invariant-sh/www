# getinvariant.sh

Static website for [Invariant Labs](https://github.com/invariant-sh), deployed with GitHub Pages.

## Local preview

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173>.

## Deployment

Pushes to `main` deploy through [the Pages workflow](./.github/workflows/pages.yml).
The custom domain is declared in [`CNAME`](./CNAME).

