function calcularVolume(treino) {
    let total = 0;

    for (const exercicio of treino.exercicios) {
        for (const serie of exercicio.series) {
            total += serie.repeticoes * serie.carga;
        }
    }

    return total;
}

function contarSeries(treino) {
    let total = 0;

    for (const exercicio of treino.exercicios) {
        total += exercicio.series.length;
    }

    return total;
}

module.exports = { contarSeries, calcularVolume };