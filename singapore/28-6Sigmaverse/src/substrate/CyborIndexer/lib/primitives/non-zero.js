const UNonZeroBase = (value, size) => {
    const _value = BigInt(value);
    if (_value <= BigInt(0)) {
        throw new Error('Value is not non-zero');
    }
    if (_value >= BigInt(2) ** BigInt(size)) {
        throw new Error('Value is too large');
    }
    return (size <= 32 ? Number(value) : value);
};
const NonZeroU8 = (value) => UNonZeroBase(value, 8);
const NonZeroU16 = (value) => UNonZeroBase(value, 16);
const NonZeroU32 = (value) => UNonZeroBase(value, 32);
const NonZeroU64 = (value) => UNonZeroBase(value, 64);
const NonZeroU128 = (value) => UNonZeroBase(value, 128);
const NonZeroU256 = (value) => UNonZeroBase(value, 256);

export { NonZeroU128, NonZeroU16, NonZeroU256, NonZeroU32, NonZeroU64, NonZeroU8 };
