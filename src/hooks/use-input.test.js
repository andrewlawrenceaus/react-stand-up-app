import { renderHook, act } from '@testing-library/react'
import useInput from './use-input'

const notEmpty = (value) => value.trim() !== ''

describe('useInput', () => {
  it('starts with empty value', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    expect(result.current.value).toBe('')
  })

  it('isValid is false for empty initial value', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    expect(result.current.isValid).toBe(false)
  })

  it('hasError is false initially even if invalid (not touched)', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    expect(result.current.hasError).toBe(false)
  })

  it('updates value on valueChangeHandler', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.valueChangeHandler({ target: { value: 'Alice' } })
    })
    expect(result.current.value).toBe('Alice')
  })

  it('isValid becomes true after typing a non-empty value', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.valueChangeHandler({ target: { value: 'Alice' } })
    })
    expect(result.current.isValid).toBe(true)
  })

  it('hasError is true when touched and value is invalid', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.inputBlurHandler()
    })
    expect(result.current.hasError).toBe(true)
  })

  it('hasError is false when touched and value is valid', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.valueChangeHandler({ target: { value: 'Alice' } })
      result.current.inputBlurHandler()
    })
    expect(result.current.hasError).toBe(false)
  })

  it('hasError is true after clearing a valid value then blurring', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.valueChangeHandler({ target: { value: 'Alice' } })
      result.current.valueChangeHandler({ target: { value: '' } })
      result.current.inputBlurHandler()
    })
    expect(result.current.hasError).toBe(true)
  })

  it('reset clears value and removes error state', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.inputBlurHandler()
    })
    expect(result.current.hasError).toBe(true)
    act(() => {
      result.current.reset()
    })
    expect(result.current.value).toBe('')
    expect(result.current.hasError).toBe(false)
  })

  it('rejects whitespace-only string as invalid', () => {
    const { result } = renderHook(() => useInput(notEmpty))
    act(() => {
      result.current.valueChangeHandler({ target: { value: '   ' } })
    })
    expect(result.current.isValid).toBe(false)
  })
})
