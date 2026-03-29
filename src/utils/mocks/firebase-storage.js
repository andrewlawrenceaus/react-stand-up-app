/**
 * Mock replacement for the 'firebase/storage' package used in E2E tests.
 * All operations are no-ops; upload and download functions resolve immediately
 * without touching the network or requiring any credentials.
 */

export function getStorage() {
  return { __isMock: true }
}

export function ref(_storage, path) {
  return { __path: path }
}

export function uploadBytes(refObj, _file) {
  return Promise.resolve({ ref: refObj })
}

export function getDownloadURL(_ref) {
  return Promise.resolve('')
}
