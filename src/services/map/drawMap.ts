import { ImageOffset, MapParameters, roadMapping } from './definitions';

export function redrawMap(par: MapParameters): void {
  if (par.context) {
    par.context.clearRect(0, 0, par.mapWidth, par.mapHeight);

    const occupyed: Record<number, boolean> = {};
    // convert tiles to occupyed by fill component width/height
    for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
      if (par.tiles[i] !== null) {
        const t = par.placements[par.tiles[i]];
        for (let j = 0; j < t.tileWidth; j++) {
          for (let k = 0; k < t.tileHeight; k++) {
            occupyed[i + k * par.mapColumns + j] = true;
          }
        }
      }
    }

    // draw roads according to direction and position
    for (let row = 0; row < par.mapRows; row++) {
      for (let col = 0; col < par.mapColumns; col++) {
        const tileIndex = row * par.mapColumns + col;
        const tile = par.tiles[tileIndex];
        const x = col * par.tileWidth;
        const y = row * par.tileHeight;
        // 1: road, 0: grass, 2: component
        const north =
          row < 0
            ? 0
            : par.tiles[tileIndex - par.mapColumns] == 0
              ? 1
              : occupyed[tileIndex - par.mapColumns]
                ? 1
                : 0;
        const south =
          row >= par.mapRows - 1
            ? 0
            : par.tiles[tileIndex + par.mapColumns] == 0
              ? 1
              : occupyed[tileIndex + par.mapColumns]
                ? 1
                : 0;
        const east =
          col >= par.mapColumns - 1
            ? 0
            : par.tiles[tileIndex + 1] == 0
              ? 1
              : occupyed[tileIndex + 1]
                ? 1
                : 0;
        const west =
          col < 0
            ? 0
            : par.tiles[tileIndex - 1] == 0
              ? 1
              : occupyed[tileIndex - 1]
                ? 1
                : 0;
        let roadImage: ImageOffset;
        if (tile === 0 && !!par.placements[tile]) {
          roadImage =
            par.roadImages[roadMapping[`${north}${east}${south}${west}`]];
        } else {
          roadImage = par.roadImages[par.mapPattern[tileIndex]];
        }

        par.context.drawImage(
          roadImage.draw,
          roadImage.xOffset * (par.baseSize + 1),
          roadImage.yOffset * (par.baseSize + 1),
          roadImage.tileWidth * par.baseSize,
          roadImage.tileHeight * par.baseSize,
          x,
          y,
          roadImage.tileWidth * par.baseSize,
          roadImage.tileHeight * par.baseSize,
        );
      }
    }

    // draw components
    for (let row = 0; row < par.mapRows; row++) {
      for (let col = 0; col < par.mapColumns; col++) {
        const tileIndex = row * par.mapColumns + col;
        const tile = par.tiles[tileIndex];
        if (tile && !!par.placements[tile]) {
          const t = par.placements[tile];
          const x = col * par.tileWidth;
          const y = row * par.tileHeight;
          par.context.drawImage(
            t.draw,
            t.xOffset * (par.baseSize + 1),
            t.yOffset * (par.baseSize + 1),
            t.tileWidth * par.baseSize,
            t.tileHeight * par.baseSize,
            x,
            y,
            t.tileWidth * par.baseSize,
            t.tileHeight * par.baseSize,
          );
        }
      }
    }
  }
}
