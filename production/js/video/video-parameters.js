export const FPS = 30;

export const WIDTH = 700;
export const HEIGHT = 400;

// ids of the aruco placed at the corners of the table
export const TOP_LEFT_ARUCO_ID = 757;
export const TOP_RIGHT_ARUCO_ID = 1;
export const BOTTOM_LEFT_ARUCO_ID = 157;
export const BOTTOM_RIGHT_ARUCO_ID = 10;

// Aruco ids that we don't want to detect (they might get detected too easily)
export const BANNED_ARUCOS = [0, 252, 254, 764, 1023];

// Parameters for houghCircles method
export const HOUGH_CIRCLES_RESOLUTION = 2; // resolution : 1 = default resolution, 2 = resolution divided by 2
export const HOUGH_CIRCLES_DISTANCE_BETWEEN_CIRCLES = 15;
export const HOUGH_CIRCLES_PARAMETER_1 = 100; // the lower it is, the more circles are detected (including false ones)
export const HOUGH_CIRCLES_PARAMETER_2 = 30;

// In pixels
export const DEFAULT_BALL_RADIUS = 10;
export const MAXIMUM_HOLES = 12;

// The factor (multiplied by the radius of a ball) for a detected circle to be considered a hole
export const HOLE_DISTANCE_FACTOR = 2.5;
