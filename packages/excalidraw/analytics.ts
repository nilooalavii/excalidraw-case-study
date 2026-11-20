// Analytics are removed from this copy. `trackEvent` stays as a no-op so the
// editor code that calls it doesn't need to change. It sends nothing anywhere.
export const trackEvent = (
  _category: string,
  _action: string,
  _label?: string,
  _value?: number,
) => {};
