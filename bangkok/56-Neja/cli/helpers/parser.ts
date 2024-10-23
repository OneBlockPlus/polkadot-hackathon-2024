// Function to parse JSON with comments
export function parseJsonWithComments(jsonString: string): any {
  // Remove single-line comments
  jsonString = jsonString.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
  // Parse the cleaned JSON string
  return JSON.parse(jsonString);
}
