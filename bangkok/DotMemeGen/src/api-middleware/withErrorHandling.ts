import { NextRequest, NextResponse } from "next/server";

const withErrorHandling = (handler: {
  (req: NextRequest, options?: any): Promise<NextResponse>;
}) => {
  return async (req: NextRequest, options: object) => {
    // CORS preflight request
    if (req.method === "OPTIONS")
      return NextResponse.json(null, { status: 200 });

    try {
      return await handler(req, options);
    } catch (error) {
      const err = error;
      // eslint-disable-next-line no-console
      console.log("Error in API call : ", req.nextUrl);
      console.log({ err });
      return NextResponse.json(
        { message: err },
        { status: (err as any)?.status },
      );
    }
  };
};

export default withErrorHandling;
