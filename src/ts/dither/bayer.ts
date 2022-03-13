/// <reference path="../pattern.ts" />

namespace Dither.Bayer {
    export enum Density64 {
        _0, // 0
        _1, // 1
        _2, // 2
        _4, // 3
        _8, // 4
        _10, // 5
        _16, // 6
        _20, // 7
        _24, // 8
        _28, // 9
        _32, // 10
        _36, // 11
        _40, // 12
        _44, // 13
        _48, // 14
        _54, // 15
        _56, // 16
        _60, // 17
        _62, // 18
        _63, // 19
        _64, // 20
    }

    export function patternFromDensity(density: Density64): PatchPattern {
        let pattern = _patterns[density];
        if (pattern === undefined) {
            throw Error();
        }
        return pattern;
    }

    export function patternFromRatio(ratio: number): PatchPattern {
        if (ratio < 0 || ratio > 1) {
            throw Error();
        }
        const n = _ratios.length - 1;
        for (let i = 0; i < n; ++i) {
            const low = _ratios[i]!;
            const high = _ratios[i + 1]!;
            if (low <= ratio && ratio <= high) {
                const deltaLow = Math.abs(ratio - low);
                const deltaHigh = Math.abs(ratio - high);
                const densityIndex = deltaLow <= deltaHigh ? i : i + 1;
                const density = _densityToEnum(_densities[densityIndex]!);
                return patternFromDensity(density);
            }
        }
        throw Error();
    }

    function _densityToEnum(density: number): Density64 {
        switch (density) {
            case 0: return Density64._0;
            case 1: return Density64._1;
            case 2: return Density64._2;
            case 4: return Density64._4;
            case 8: return Density64._8;
            case 10: return Density64._10;
            case 16: return Density64._16;
            case 20: return Density64._20;
            case 24: return Density64._24;
            case 28: return Density64._28;
            case 32: return Density64._32;
            case 36: return Density64._36;
            case 40: return Density64._40;
            case 44: return Density64._44;
            case 48: return Density64._48;
            case 54: return Density64._54;
            case 56: return Density64._56;
            case 60: return Density64._60;
            case 62: return Density64._62;
            case 63: return Density64._63;
            case 64: return Density64._64;
            default: throw Error();
        }
    }

    const _densities: number[] = [
        0,
        1,
        2,
        4,
        8,
        10,
        16,
        20,
        24,
        28,
        32,
        36,
        40,
        44,
        48,
        54,
        56,
        60,
        62,
        63,
        64,
    ];

    const _ratios: number[] = _densities.map((d) => d / 64);

    function _convert(c: string): A | B {
        switch (c) {
            case '.': return A;
            case 'X': return B;
            default: throw Error();
        }
    }

    function makePattern(encoding: string[]): PatchPattern {
        const gridArray: (A | B)[][] = [];
        for (const lane of encoding) {
            const converted = lane.split("").map(_convert);
            gridArray.push(converted);
        }
        const grid = Grid2d.from2d(gridArray);
        return new PatchPattern(grid);
    }

    const _patterns = [
        // 0
        makePattern([
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
        ]),
        // 1
        makePattern([
            "........",
            "........",
            "........",
            "........",
            "........",
            ".....X..",
            "........",
            "........",
        ]),
        // 2
        makePattern([
            "........",
            ".X......",
            "........",
            "........",
            "........",
            ".....X..",
            "........",
            "........",
        ]),
        // 3
        makePattern([
            "........",
            ".X...X..",
            "........",
            "........",
            "........",
            ".X...X..",
            "........",
            "........",
        ]),
        // 4
        makePattern([
            "........",
            "X...X...",
            "........",
            "..X...X.",
            "........",
            "X...X...",
            "........",
            "..X...X.",
        ]),
        // 5
        makePattern([
            "........",
            "X...X.X.",
            "........",
            "..X...X.",
            "........",
            "X.X.X...",
            "........",
            "..X...X.",
        ]),
        // 6
        makePattern([
            "........",
            "X.X.X.X.",
            "........",
            "X.X.X.X.",
            "........",
            "X.X.X.X.",
            "........",
            "X.X.X.X.",
        ]),
        // 7
        makePattern([
            "........",
            "X.X.X.X.",
            ".X...X..",
            "X.X.X.X.",
            "........",
            "X.X.X.X.",
            ".X...X..",
            "X.X.X.X.",
        ]),
        // 8
        makePattern([
            ".X...X..",
            "X.X.X.X.",
            "...X...X",
            "X.X.X.X.",
            ".X...X..",
            "X.X.X.X.",
            "...X...X",
            "X.X.X.X.",
        ]),
        // 9
        makePattern([
            ".X...X..",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
            ".X...X..",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
        ]),
        // 10
        makePattern([
            ".X.X.X.X",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
        ]),
        // 11
        makePattern([
            "XX.XXX.X",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
            "XX.XXX.X",
            "X.X.X.X.",
            ".X.X.X.X",
            "X.X.X.X.",
        ]),
        // 12
        makePattern([
            "XX.XXX.X",
            "X.X.X.X.",
            ".XXX.XXX",
            "X.X.X.X.",
            "XX.XXX.X",
            "X.X.X.X.",
            ".XXX.XXX",
            "X.X.X.X.",
        ]),
        // 13
        makePattern([
            "XXXXXXXX",
            "X.X.X.X.",
            "XX.XXX.X",
            "X.X.X.X.",
            "XXXXXXXX",
            "X.X.X.X.",
            "XX.XXX.X",
            "X.X.X.X.",
        ]),
        // 14
        makePattern([
            "XXXXXXXX",
            "X.X.X.X.",
            "XXXXXXXX",
            "X.X.X.X.",
            "XXXXXXXX",
            "X.X.X.X.",
            "XXXXXXXX",
            "X.X.X.X.",
        ]),
        // 15
        makePattern([
            "XXXXXXXX",
            "X.X.XXX.",
            "XXXXXXXX",
            "X.XXX.XX",
            "XXXXXXXX",
            "XXX.X.X.",
            "XXXXXXXX",
            "X.XXX.XX",
        ]),
        // 16
        makePattern([
            "XXXXXXXX",
            "XXX.XXX.",
            "XXXXXXXX",
            "X.XXX.XX",
            "XXXXXXXX",
            "XXX.XXX.",
            "XXXXXXXX",
            "X.XXX.XX",
        ]),
        // 17
        makePattern([
            "XXXXXXXX",
            "XX.XXX.X",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XX.XXX.X",
            "XXXXXXXX",
            "XXXXXXXX",
        ]),
        // 18
        makePattern([
            "XXXXXXXX",
            "XXXXXX.X",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XX.XXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
        ]),
        // 19
        makePattern([
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XX.XXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
        ]),
        // 20
        makePattern([
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
            "XXXXXXXX",
        ]),
    ];
}
