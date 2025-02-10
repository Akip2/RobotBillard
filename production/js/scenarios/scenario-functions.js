export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEmpty(tab) {
    return tab.length === 0;
}