import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const STORAGE_ROOT = join(process.cwd(), 'storage', 'models');

export function getModelDir(modelId: string): string {
  return join(STORAGE_ROOT, modelId);
}

export function getModelFilePath(modelId: string, fileName: string): string {
  return join(getModelDir(modelId), fileName);
}

export function saveModelFile(modelId: string, fileName: string, data: Buffer | Uint8Array): void {
  const dir = getModelDir(modelId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(join(dir, fileName), data);
}

export function readModelFile(modelId: string, fileName: string): Buffer {
  return readFileSync(getModelFilePath(modelId, fileName));
}

export function deleteModelDir(modelId: string): void {
  const dir = getModelDir(modelId);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function getFileExtension(filename: string): string {
  return extname(filename).slice(1).toLowerCase();
}

export function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    stl: 'model/stl',
    gltf: 'model/gltf+json',
    glb: 'model/gltf-binary',
    obj: 'model/obj',
    fbx: 'application/octet-stream',
    step: 'model/step',
    stp: 'model/step',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}
