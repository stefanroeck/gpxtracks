export const durationString = (durationInSeconds: number): string => {
    const date = new Date(0);
    date.setSeconds(durationInSeconds);
    return date.toISOString().substring(11, 19);
}

export const averageSpeed = (distance: number, durationInSeconds: number): string => {
    const speed = distance / durationInSeconds;
    return (speed * 3.6).toFixed(2);
}