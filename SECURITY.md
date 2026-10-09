# Security policy

## Supported versions

Security fixes are released for the latest minor version of each
`@colspec/*` package.

## Reporting a vulnerability

Please do not report security problems in public issues.

Email omkletu+github@gmail.com with a description, the affected package and
version, and steps to reproduce. You should get an acknowledgement within a
few days, and you will be credited in the release notes unless you prefer
otherwise.

## What counts

colspec's security-relevant guarantees are:

- Nothing stored in a contract is executed; references resolve only to
  functions the application registered.
- `resolveServerQuery` only yields fields from the list the backend supplies.

A way around either is a vulnerability. Authentication and authorization of
the endpoints that store, publish or serve contracts and data belong to the
consuming application.
