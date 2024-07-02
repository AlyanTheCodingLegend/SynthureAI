function addTimestampToUrl(url: string) {
    var timestamp = new Date().getTime();
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'timestamp=' + timestamp;
}

export default addTimestampToUrl;