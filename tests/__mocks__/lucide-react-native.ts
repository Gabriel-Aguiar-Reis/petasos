/* eslint-disable @typescript-eslint/no-explicit-any */
// Stub: icons don't render in the Node test environment.
// The test suite only exercises pure utility functions from format.tsx,
// not iconFor, so returning null for every named export is sufficient.
const stub = new Proxy({} as any, { get: () => null })
module.exports = stub
