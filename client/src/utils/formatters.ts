export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.getFullYear() + '-' + padLeadindZeros(date.getMonth() + 1) + '-' + padLeadindZeros(date.getDate())
        + ' ' + padLeadindZeros(date.getHours()) + ':' + padLeadindZeros(date.getMinutes());
}
function padLeadindZeros(num: number) {
    return String(num).padStart(2, '0');
}

export function formatTags(tags: string[]): string {
    return tags.join('; ');
}