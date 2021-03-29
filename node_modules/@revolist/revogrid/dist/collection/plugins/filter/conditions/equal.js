const eq = (value, extra) => {
  if (typeof value === 'undefined' || (value === null && !extra)) {
    return true;
  }
  if (typeof value !== 'string') {
    value = JSON.stringify(value);
  }
  return value.toLocaleLowerCase() === extra;
};
export const notEq = (value, extra) => !eq(value, extra);
notEq.extra = 'input';
eq.extra = 'input';
export default eq;
