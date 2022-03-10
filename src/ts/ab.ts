interface A { __brand_A: string; }
const A: A = { __brand_A: "A" };

interface B { __brand_B: string; }
const B: B = { __brand_B: "B" };

function flipAB(ab: A | B): A | B {
    return ab === A ? B : A;
}
