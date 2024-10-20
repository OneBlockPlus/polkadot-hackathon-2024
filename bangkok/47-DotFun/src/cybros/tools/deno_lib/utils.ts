function stringToInteger(n: string) {
  const parsed = parseInt(n);
  if (isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

export {
  stringToInteger
}
