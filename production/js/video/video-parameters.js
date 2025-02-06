export const FPS = 30;

export const WIDTH = 700;
export const HEIGHT = 400;

// ids of the aruco placed at the corners of the table
export const topLeftId = 757;
export const topRightId = 1;
export const bottomLeftId = 157;
export const bottomRightId = 10;

// Aruco ids that we don't want to detect (they might get detected too easily)
export const bannedArucos = [0];

// Parameters for houghCircles method
export const houghCirclesResolution = 2; // resolution : 1 = default resolution, 2 = resolution divided by 2
export const houghCirclesDistanceBetweenCircles = 15;
export const houghCirclesParameter1 = 100; // the lower it is, the more circles are detected (including false ones)
export const houghCirclesParameter2 = 30;

export const defaultBallRadius = 10;

// Distance in pixel needed to be considered a ball instead of a hole
export const distanceFromBorder = 38;
