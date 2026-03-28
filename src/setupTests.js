import '@testing-library/jest-dom'
import { fetch, Request, Response, Headers } from 'undici'

// Polyfill Fetch API for jsdom environment
// (needed by React Router's data router / createMemoryRouter)
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers
