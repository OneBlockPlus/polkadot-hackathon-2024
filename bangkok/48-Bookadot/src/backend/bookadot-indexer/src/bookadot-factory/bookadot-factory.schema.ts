export const createBookadotFactorySchema = (p: P) => ({
    Book: p.createTable(
      {
        id: p.string(),
        property: p.hex(),
        bookedTimestamp: p.int(),
        checkInTimestamp: p.int(),
        checkOutTimestamp: p.int(),
        balance: p.float(), // should remove decimals before storing
        ticketId: p.bigint(),
        guest: p.hex(),
        token: p.hex(),
        status: p.int(),
        cancellationPolicies: p.string(),
      },
      {
        bookIndex: p.index(["guest", "id", "property"]),
      }
    ),
});
