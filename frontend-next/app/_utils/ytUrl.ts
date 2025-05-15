function encodeYouTubeSearchString(searchString: string): string {
    if (!searchString) return '';
    
    const encoded : string = searchString
      .replace(/ /g, '+')
      .replace(/=/g, '%3D')
      .replace(/!/g, '%21')
      .replace(/\*/g, '%2A')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/;/g, '%3B')
      .replace(/:/g, '%3A')
      .replace(/@/g, '%40')
      .replace(/&/g, '%26')
      .replace(/\[/g, '%5B')
      .replace(/\]/g, '%5D')
      .replace(/,/g, '%2C')
      .replace(/\//g, '%2F')
      .replace(/\?/g, '%3F')
      .replace(/#/g, '%23')
      .replace(/%/g, '%25')
      .replace(/\$/g, '%24')
      .replace(/\{/g, '%7B')
      .replace(/\}/g, '%7D')
      .replace(/\\/g, '%5C')
      .replace(/\^/g, '%5E')
      .replace(/~/g, '%7E')
      .replace(/`/g, '%60');
    
    return encoded;
}

export function createYouTubeSearchURL(searchString: string): string {
    const encodedSearch: string = encodeYouTubeSearchString(searchString);

    return `https://www.youtube.com/results?search_query=${encodedSearch}`;
}
