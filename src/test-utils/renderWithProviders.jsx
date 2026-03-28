import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../components/store/AuthProvider'

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

export function renderWithAuth(ui, { user = null } = {}) {
  return render(
    <AuthContext.Provider value={{ user }}>{ui}</AuthContext.Provider>
  )
}

export function renderWithAll(ui, { user = null, route = '/' } = {}) {
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  )
}
