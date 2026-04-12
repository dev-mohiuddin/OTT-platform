export const OTT_THUMBNAILS: string[] = [
  "https://picsum.photos/seed/dristy-cinema-01/800/1200",
  "https://picsum.photos/seed/dristy-cinema-02/800/1200",
  "https://picsum.photos/seed/dristy-cinema-03/800/1200",
  "https://picsum.photos/seed/dristy-cinema-04/800/1200",
  "https://picsum.photos/seed/dristy-cinema-05/800/1200",
  "https://picsum.photos/seed/dristy-cinema-06/800/1200",
  "https://picsum.photos/seed/dristy-cinema-07/800/1200",
  "https://picsum.photos/seed/dristy-cinema-08/800/1200",
  "https://picsum.photos/seed/dristy-cinema-09/800/1200",
  "https://picsum.photos/seed/dristy-cinema-10/800/1200",
  "https://picsum.photos/seed/dristy-cinema-11/800/1200",
  "https://picsum.photos/seed/dristy-cinema-12/800/1200",
  "https://picsum.photos/seed/dristy-cinema-13/800/1200",
  "https://picsum.photos/seed/dristy-cinema-14/800/1200",
  "https://picsum.photos/seed/dristy-cinema-15/800/1200",
  "https://picsum.photos/seed/dristy-cinema-16/800/1200",
];

export function getThumbnailByIndex(index: number): string {
  const safeIndex = Math.abs(index) % OTT_THUMBNAILS.length;
  return OTT_THUMBNAILS[safeIndex];
}
