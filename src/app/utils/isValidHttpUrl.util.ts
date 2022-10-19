  // Onko string muodoltaan HTTP URL.
  export function isValidHttpUrl(testString: string): boolean {
    let url: URL;  
    try {
      url = new URL(testString);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }