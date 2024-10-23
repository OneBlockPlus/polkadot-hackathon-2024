import { useMutation } from "@tanstack/react-query";

export const useGenerateProof = () => {
  const mutation = useMutation({
    mutationKey: ["generateProof"],
    mutationFn: async (inputs: {
      jwt: string;
      salt: string;
      keyStr: string;
      epoch: string;
      randomness: string;
    }): Promise<{
      proof: {
        proof_points: {
          a: any;
          b: any;
          c: any;
        };
        iss_base64_details: any;
        header: any;
      };
      addressSeed: any;
    }> => {
      const response = await fetch("http://localhost:3056/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      const res = await response.json();
      return res.result;
    },
  });

  return mutation;
};
