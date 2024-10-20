import {
  getMapParameters,
  ImageOffset,
  MapParameters,
  roadMapping,
} from './definitions';

export function mountCanvas(canvas: HTMLCanvasElement): MapParameters {
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const par = getMapParameters(context);

  canvas.addEventListener('mousedown', (e) => doMouseDown(e, par));
  document.addEventListener('contextmenu', (event: Event) =>
    event.preventDefault(),
  );
  canvas.addEventListener('mousemove', (e) => doMouseMove(e, par));
  canvas.addEventListener('click', (e) => doMouseClick(e, par));
  canvas.addEventListener('mouseup', (e) => doMouseUp(e, par));

  // draw the grid
  for (let i: number = 0; i <= par.mapColumns; i++) {
    context.moveTo(i * par.tileWidth, 0);
    context.lineTo(i * par.tileWidth, par.mapHeight);
  }
  context.stroke();
  for (let i: number = 0; i <= par.mapRows; i++) {
    context.moveTo(0, i * par.tileHeight);
    context.lineTo(par.mapWidth, i * par.tileHeight);
  }
  context.stroke();

  redrawMap(par);

  return par;
}

// const mapPattern = generateMapPattern(mapColumns, mapRows);

// Function to redraw the map
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

function doMouseUp(_e: MouseEvent, par: MapParameters): void {
  par.mouseState = 'Normal';
}

function doMouseDown(e: MouseEvent, par: MapParameters): void {
  if (e.button === 0) {
    par.mouseState = 'LeftDown';
  } else if (e.button === 2) {
    par.mouseState = 'RightDown';
  }
  const x: number = e.offsetX;
  const y: number = e.offsetY;
  // let gridX: number = Math.floor(x / tileWidth) * tileWidth;
  // let gridY: number = Math.floor(y / tileHeight) * tileHeight;

  if (y <= par.mapHeight && x <= par.mapWidth) {
    // // source
    // let tileX: number = Math.floor(x / tileWidth);
    // let tileY: number = Math.floor((y - mapHeight) / tileHeight);
    // sourceTile = tileY * (sourceWidth / tileWidth) + tileX;
    // sourceX = gridX;
    // sourceY = gridY - mapHeight;
    // redrawSource();
    setTile(e, par);
    redrawMap(par);
    // drawBox();
  }
}

function doMouseMove(e: MouseEvent, par: MapParameters): void {
  const x: number = e.offsetX;
  const y: number = e.offsetY;
  const gridX = Math.floor(x / par.tileWidth) * par.tileWidth;
  const gridY = Math.floor(y / par.tileHeight) * par.tileHeight;

  if (par.mouseState != 'Normal') setTile(e, par);

  if (y <= par.mapHeight && x <= par.mapWidth) {
    // source
    // context.clearRect(0, mapHeight, sourceWidth, sourceHeight);
    redrawMap(par);
    // redrawSource();
    par.context.beginPath();
    par.context.strokeStyle = 'blue';
    let boxWidth = par.tileWidth;
    let boxHeight = par.tileHeight;
    if (par.placements[par.sourceTile]) {
      boxWidth = par.tileWidth * par.placements[par.sourceTile].tileWidth;
      boxHeight = par.tileHeight * par.placements[par.sourceTile].tileHeight;
    }
    par.context.rect(gridX, gridY, boxWidth, boxHeight);
    par.context.stroke();
    // drawBox();
  }
}

function doMouseClick(e: MouseEvent, par: MapParameters): void {
  setTile(e, par);
}

function setTile(
  e: MouseEvent,

  par: MapParameters,
): void {
  const x: number = e.offsetX;
  const y: number = e.offsetY;
  if (y < par.mapHeight && x < par.mapWidth) {
    const tileX: number = Math.floor(x / par.tileWidth);
    const tileY: number = Math.floor(y / par.tileHeight);
    const targetTile: number = tileY * par.mapColumns + tileX;
    if (par.mouseState == 'RightDown') {
      par.tiles[targetTile] = null;
      return;
    }

    if (par.placements[par.sourceTile] === null) return;
    const t = par.placements[par.sourceTile];
    if (isLocationBlocked(tileX, tileY, t.tileWidth, t.tileHeight, par)) return;
    par.tiles[targetTile] = par.sourceTile;
  }
}

function isLocationBlocked(
  tileX: number,
  tileY: number,
  tileWidth: number,
  tileHeight: number,
  par: MapParameters,
) {
  for (let i = 0; i < par.mapColumns * par.mapRows; i++) {
    if (par.tiles[i] !== null) {
      const existingTile = par.placements[par.tiles[i]];
      const existingTileX = i % par.mapColumns;
      const existingTileY = Math.floor(i / par.mapColumns);

      // Check if the expected rectangle overlaps with the existing rectangle
      if (
        tileX < existingTileX + existingTile.tileWidth &&
        tileX + tileWidth > existingTileX &&
        tileY < existingTileY + existingTile.tileHeight &&
        tileY + tileHeight > existingTileY
      ) {
        return true;
      }
    }
  }
  return false;
}
