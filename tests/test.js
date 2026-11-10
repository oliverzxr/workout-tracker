const test = require("node:test");
const assert = require("node:assert/strict");

const { contarSeries, calcularVolume } = require("../src/treino");

const treino = {
    nome: "Push A",
    exercicios: [
        {
            nome: "Supino inclinado",
            series: [
                { repeticoes: 10, carga: 40 },
                { repeticoes: 8, carga: 40 }
            ]
        },
        {
            nome: "Elevação lateral",
            series: [
                { repeticoes: 15, carga: 8 },
                { repeticoes: 12, carga: 8 },
                { repeticoes: 10, carga: 8 }
            ]
        }
    ]
};

test("deve contar as séries corretamente", () => {
    assert.equal(contarSeries(treino), 5);
});

test("deve calcular o volume de carga corretamente", () => {
    assert.equal(calcularVolume(treino), 1016);
});