# Contributing to getinvariant.sh

By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

This repository is the static Invariant Labs website. Keep it small: HTML, CSS,
and assets. No analytics beacons, no secrets, no build toolchain unless we add
one on purpose.

## Preview

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173>.

## Pull requests

Target `main`. Pushes to `main` deploy via GitHub Pages. Check `CNAME` still
contains `getinvariant.sh`.
