const Arduino = (() => {
  function ativar() {
    window.addEventListener("keydown", function (evento) {
      if (evento.repeat) return;
      if (evento.key.toUpperCase() === CONFIG.TECLA_SENSOR.toUpperCase()) {
        window.dispatchEvent(new CustomEvent("hele:visitante"));
      }
    });
  }

  return { ativar: ativar };
})();