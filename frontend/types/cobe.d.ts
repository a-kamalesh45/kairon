declare module "cobe" {
    export interface COBEOptions {
        width?: number
        height?: number
        onRender?: (state: any) => void
        devicePixelRatio?: number
        phi?: number
        theta?: number
        dark?: number
        diffuse?: number
        mapSamples?: number
        mapBrightness?: number
        baseColor?: [number, number, number]
        markerColor?: [number, number, number]
        glowColor?: [number, number, number]
        markers?: Array<{ location: [number, number]; size?: number }>
        [key: string]: any
    }

    export default function createGlobe(
        canvas: HTMLCanvasElement,
        opts?: COBEOptions
    ): { destroy: () => void }

    export { COBEOptions }
}
