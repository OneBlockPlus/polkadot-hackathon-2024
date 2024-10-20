import { getMapParameters, MapParameters } from './definitions';
import { redrawMap } from './drawMap';

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

  if (y <= par.mapHeight && x <= par.mapWidth) {
    setTile(e, par);
    redrawMap(par);
  }
}

function doMouseMove(e: MouseEvent, par: MapParameters): void {
  const x: number = e.offsetX;
  const y: number = e.offsetY;
  const gridX = Math.floor(x / par.tileWidth) * par.tileWidth;
  const gridY = Math.floor(y / par.tileHeight) * par.tileHeight;

  if (par.mouseState != 'Normal') setTile(e, par);

  if (y <= par.mapHeight && x <= par.mapWidth) {
    redrawMap(par);
    let boxWidth = par.tileWidth;
    let boxHeight = par.tileHeight;
    if (par.placements[par.sourceTile]) {
      boxWidth = par.tileWidth * par.placements[par.sourceTile].tileWidth;
      boxHeight = par.tileHeight * par.placements[par.sourceTile].tileHeight;
    }

    par.context.beginPath();
    par.context.strokeStyle = 'blue';
    par.context.rect(gridX, gridY, boxWidth, boxHeight);
    par.context.stroke();
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
