export function stripFilenameFromImageUrl(url: string): string | null {
  const regex = /\/public\/images\/([^/]+\/[^/]+)$/;
  const match = url.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

export function stripFilenameFromSongUrl(url: string): string | null {
  const regex = /\/public\/songs\/([^/]+\/[^/]+)$/;
  const match = url.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}