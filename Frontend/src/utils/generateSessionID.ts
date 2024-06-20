function generateSessionID() {
    return (Math.floor(Math.random() * 900) + 100);
}

export default generateSessionID;