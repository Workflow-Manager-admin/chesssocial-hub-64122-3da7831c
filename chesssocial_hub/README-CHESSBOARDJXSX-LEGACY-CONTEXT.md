# Note on chessboardjsx "legacy context API" warnings

The `chessboardjsx` library is built using an older version of React APIs, specifically relying on the "legacy context" system which predates React 16.3's new Context API.

If you see warnings like:

> Warning: Legacy context API has been detected within a strict-mode tree. The old API will be supported in all 16.x releases, but applications using it should migrate to the new API.

This is expected for `chessboardjsx` and will appear during development. The warnings do NOT break functionality, but they can clutter your development console.

**What you should do:**

- You cannot fix these warnings locally unless you switch to a modern maintained chessboard component, or the library itself updates.
- It is safe to ignore them if everything works as intended.
- If releasing to production and the warnings bother you, consider using a different chessboard library or forking and modernizing `chessboardjsx` with new context APIs.

For now, the code is correct and the warning is cosmetic.

_ChessSocial Hub maintainers_
