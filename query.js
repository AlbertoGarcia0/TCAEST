(() => {
    const nombreTema = document.querySelector('h1')?.textContent.trim() || "preguntas";

    const preguntas = document.querySelectorAll('.box__results .pre.fw-medium.text-start');
    const data = { Preguntas: [] };

    const toUnicodeEscape = str =>
        str.replace(/[\u00A0-\uFFFF]/g, c => {
            return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
        });

    preguntas.forEach((preguntaElem) => {
        let preguntaTexto = preguntaElem.textContent.trim();
        preguntaTexto = preguntaTexto.replace(/^\d+\.\s*/, '');

        const bloqueResultados = preguntaElem.closest('.box__results');
        const respuestas = bloqueResultados.querySelectorAll('.result__opt');

        const opciones = [];
        let respuestaCorrecta = null;

        respuestas.forEach((respuestaElem, i) => {
            const textoRespuesta = respuestaElem.querySelector('.pre')?.textContent.trim() || '';
            opciones.push(`${String.fromCharCode(97 + i)}) ${textoRespuesta}`);
            if (respuestaElem.classList.contains('result__opt--correct')) {
                respuestaCorrecta = i + 1;
            }
        });

        data.Preguntas.push({
            enunciado: preguntaTexto,
            respuestas: opciones,
            verdadera: respuestaCorrecta
        });
    });

    let salida = JSON.stringify(data, null, 4);
    salida = toUnicodeEscape(salida);

    const blob = new Blob([salida], { type: 'application/json;charset=iso-8859-1' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `${nombreTema.replace(/\s+/g, '_').toLowerCase()}.json`;
    enlace.click();

    console.log(`✅ Archivo JSON generado con escapes Unicode: ${nombreTema}.json`);
})();