/** `'data'` spans the readings' own min..max, which shows the shape: a dip from 99.5 to 93.1 fills
 *  the box. `'zero'` keeps zero on the scale, which shows the size: the same dip is a sliver at
 *  the top. */
export type SparklineScale = 'data' | 'zero';
