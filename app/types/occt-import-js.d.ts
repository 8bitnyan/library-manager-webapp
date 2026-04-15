declare module 'occt-import-js' {
  export type OcctTypedArray = Float32Array | Float64Array | Int32Array | Uint32Array | Uint16Array | Uint8Array;

  export interface OcctStepAttribute {
    array: OcctTypedArray;
  }

  export interface OcctStepMesh {
    attributes: {
      position: OcctStepAttribute;
      normal?: OcctStepAttribute;
    };
    index?: OcctStepAttribute;
    color?: [number, number, number];
  }

  export interface OcctStepResult {
    meshes: OcctStepMesh[];
  }

  export interface OcctImporter {
    ReadStepFile(data: Uint8Array, params: null): OcctStepResult;
  }

  export default function occtimportjs(options?: { locateFile?: (path: string) => string }): Promise<OcctImporter>;
}
