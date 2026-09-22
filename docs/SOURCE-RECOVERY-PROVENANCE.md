# Canonical source recovery provenance

Updated: 2026-09-22

The canonical runtime recovery source for Milestone A is the user-provided conversation upload `grok-workspace.zip`.

Archive:

- bytes: `2614603`
- SHA-256: `6819707f4c4f47d46eca23c7d70ff0631ea82c1f45ef07b07fbec5f5af11128d`

Recovered runtime files:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/lib/catalog.ts` | 5452 | `b8f0a1f7caf8a96575b31f161dd78943c7c3f5a769c23c55c818a24966ba3aba` |
| `src/lib/html-apps.ts` | 12867 | `6adfbd1481006028e6bdbef16b497979856fb7493e48d80f5f7214bf662c64d9` |
| `src/lib/store.ts` | 12145 | `75cc83ad42203cb88017b3fef8d73715aa5a70280f6124f9f99ba91733565d72` |
| `src/lib/stream-chat.ts` | 1591 | `f0f510c6d8a2265a951d053de15da97778c6ebcf32067cbbe0e3200db62b5c75` |
| `src/lib/types.ts` | 2608 | `e5055c33748c0c6d01de4d0454dbbef62885b43eba0f5dceb8d7b430e71301b8` |
| `src/lib/utils.ts` | 1154 | `b3e944537c962b15797f72148639512053ffc36bcdf93a9d5d4d83574f889fc0` |

Package provenance from the same archive:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `package.json` | 3505 | `1c8c970bdc9a22c70d8692e641b1e4fe95ab733708c460fb248edd3531f7805d` |
| `package-lock.json` | 262769 | `fc81314ce9ca4b6be0300e35a223455005daf314253a131134bf089a5b2ba4af` |

The dependency, devDependency and override declarations in the recovered `package.json` match the normalized branch. The branch intentionally contains additional security/CI scripts added during the hardening work, so the canonical package file is not blindly copied over those deliberate changes.

The authoritative `package-lock.json` must be imported byte-for-byte from this archive. It must not be regenerated as a substitute for recovery.

This provenance record supersedes the earlier assumption that only unauthenticated Base64 fragments were available. The historical transfer fragments remain non-authoritative.
