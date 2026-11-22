/* Vida Acessível - app.js
   Recursos: tema claro/escuro, tamanho da fonte, espaçamento de texto,
   avisos para leitor de tela e checklist com progresso salvo. */

(function () {
  'use strict';

  var raiz = document.documentElement;
  var CHAVE = 'vida-acessivel-prefs';
  var CHAVE_CHECK = 'vida-acessivel-checklist';
  var MIN = 100, MAX = 150, PASSO = 10;

  var prefs = { tamanho: 100, escuro: null, espaco: false };

  function ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; }
  }
  function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
  }

  var salvo = ler(CHAVE);
  if (salvo && typeof salvo.tamanho === 'number') {
    prefs.tamanho = Math.min(MAX, Math.max(MIN, salvo.tamanho));
    prefs.escuro = salvo.escuro;
    prefs.espaco = !!salvo.espaco;
  }
  if (prefs.escuro === null) {
    prefs.escuro = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function aplicar() {
    raiz.style.fontSize = prefs.tamanho + '%';
    if (prefs.escuro) { raiz.setAttribute('data-tema', 'escuro'); } else { raiz.removeAttribute('data-tema'); }
    if (prefs.espaco) { raiz.setAttribute('data-espaco', 'amplo'); } else { raiz.removeAttribute('data-espaco'); }
  }

  function avisar(texto) {
    var area = document.getElementById('aviso');
    if (!area) return;
    area.textContent = '';
    window.setTimeout(function () { area.textContent = texto; }, 50);
  }

  aplicar();

  document.addEventListener('DOMContentLoaded', function () {
    iniciarAjustes();
    iniciarChecklist();
  });

  function iniciarAjustes() {
    var caixa = document.getElementById('ajustes');
    if (!caixa) return;
    caixa.hidden = false;

    var bMenos = document.getElementById('btn-menos');
    var bMais = document.getElementById('btn-mais');
    var bTema = document.getElementById('btn-tema');
    var bEspaco = document.getElementById('btn-espaco');
    var bReset = document.getElementById('btn-reset');

    bTema.setAttribute('aria-pressed', String(prefs.escuro));
    bEspaco.setAttribute('aria-pressed', String(prefs.espaco));

    bMais.addEventListener('click', function () {
      if (prefs.tamanho >= MAX) { avisar('Tamanho máximo atingido.'); return; }
      prefs.tamanho += PASSO; aplicar(); gravar(CHAVE, prefs);
      avisar('Texto em ' + prefs.tamanho + '%.');
    });

    bMenos.addEventListener('click', function () {
      if (prefs.tamanho <= MIN) { avisar('Tamanho mínimo atingido.'); return; }
      prefs.tamanho -= PASSO; aplicar(); gravar(CHAVE, prefs);
      avisar('Texto em ' + prefs.tamanho + '%.');
    });

    bTema.addEventListener('click', function () {
      prefs.escuro = !prefs.escuro;
      bTema.setAttribute('aria-pressed', String(prefs.escuro));
      aplicar(); gravar(CHAVE, prefs);
      avisar(prefs.escuro ? 'Tema escuro ativado.' : 'Tema claro ativado.');
    });

    bEspaco.addEventListener('click', function () {
      prefs.espaco = !prefs.espaco;
      bEspaco.setAttribute('aria-pressed', String(prefs.espaco));
      aplicar(); gravar(CHAVE, prefs);
      avisar(prefs.espaco ? 'Espaçamento de texto ampliado.' : 'Espaçamento de texto padrão.');
    });

    bReset.addEventListener('click', function () {
      prefs.tamanho = 100; prefs.espaco = false;
      prefs.escuro = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      bTema.setAttribute('aria-pressed', String(prefs.escuro));
      bEspaco.setAttribute('aria-pressed', 'false');
      aplicar(); gravar(CHAVE, prefs);
      avisar('Ajustes restaurados.');
    });
  }

  /* ===== Checklist com progresso ===== */
  function iniciarChecklist() {
    var area = document.getElementById('checklist');
    if (!area) return;

    var caixas = area.querySelectorAll('input[type="checkbox"]');
    var barra = document.getElementById('barra');
    var texto = document.getElementById('progresso-texto');
    var limpar = document.getElementById('btn-limpar');
    var marcados = ler(CHAVE_CHECK) || {};

    caixas.forEach(function (c) { c.checked = !!marcados[c.id]; });

    function atualizar(falar) {
      var total = caixas.length;
      var feitos = 0;
      caixas.forEach(function (c) { if (c.checked) feitos++; });
      barra.max = total;
      barra.value = feitos;
      var msg = feitos + ' de ' + total + ' itens verificados.';
      texto.textContent = msg;
      if (falar) avisar(msg);
    }

    caixas.forEach(function (c) {
      c.addEventListener('change', function () {
        marcados[c.id] = c.checked;
        gravar(CHAVE_CHECK, marcados);
        atualizar(false); /* o texto de progresso já é uma região "status" */
      });
    });

    limpar.addEventListener('click', function () {
      caixas.forEach(function (c) { c.checked = false; });
      marcados = {};
      gravar(CHAVE_CHECK, marcados);
      atualizar(false);
      caixas[0].focus();
    });

    atualizar(false);
  }
})();
