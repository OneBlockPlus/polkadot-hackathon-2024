export class PinataManager {
  private readonly baseUrl: string;
  private readonly jwt: string;

  constructor(jwt: string) {
    this.baseUrl = "https://api.pinata.cloud/pinning";
    this.jwt = jwt;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  public async pinFile(
    file: File,
    metadata: object = {},
    options: object = {}
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataOptions", JSON.stringify(options));
      formData.append("pinataMetadata", JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/pinFileToIPFS`, {
        method: "POST",
        headers: this.getHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to pin file. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `View the file here: https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
      );
      return data.IpfsHash;
    } catch (error) {
      throw error;
    }
  }

  public async unpinFile(ipfsHash: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/unpin/${ipfsHash}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to unpin file. Status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }
}
