interface A { __brand_A: string; }
const A: A = { __brand_A: "A" };

interface B { __brand_B: string; }
const B: B = { __brand_B: "B" };

function flipAB(ab: A | B): A | B {
    return ab === A ? B : A;
}

interface Dim1 { __brand_Dim1: string; }
const Dim1: Dim1 = { __brand_Dim1: "Dim1" };

interface Dim2 { __brand_Dim2: string; }
const Dim2: Dim2 = { __brand_Dim2: "Dim2" };

