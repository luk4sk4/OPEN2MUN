import { lazy } from 'react';

// Lazy load widgets to reduce main bundle size and improve initial load time
const CronometroPrincipal = lazy(() => import('./CronometroPrincipal'));
const ListaOradores = lazy(() => import('./ListaOradores'));
const PizarraMociones = lazy(() => import('./PizarraMociones'));
const CronometroDual = lazy(() => import('./CronometroDual'));
const CronometroOnlyTime = lazy(() => import('./CronometroOnlyTime'));
const MatrizPaises = lazy(() => import('./MatrizPaises'));
const HistoricoDelegaciones = lazy(() => import('./HistoricoDelegaciones'));
const VotacionOficial = lazy(() => import('./VotacionOficial'));
const EstablecerAgenda = lazy(() => import('./EstablecerAgenda'));
const ImportarPaises = lazy(() => import('./ImportarPaises'));
const ConfigurarComite = lazy(() => import('./ConfigurarComite'));
const AnadirPaises = lazy(() => import('./AnadirPaises'));
const AnadirPaisesGSL = lazy(() => import('./AnadirPaisesGSL'));
const AnadirPaisesDebate = lazy(() => import('./AnadirPaisesDebate'));
const SelectorAleatorio = lazy(() => import('./SelectorAleatorio'));
const GestorCrisis = lazy(() => import('./GestorCrisis'));
const TeleNoticiasCrisis = lazy(() => import('./TeleNoticiasCrisis'));
const PizarraInteractiva = lazy(() => import('./PizarraInteractiva'));
const MapaVotacion = lazy(() => import('./MapaVotacion'));
const MiniVotacion = lazy(() => import('./MiniVotacion'));
const ControladorEnmiendas = lazy(() => import('./ControladorEnmiendas'));
const CronometroEnmiendas = lazy(() => import('./CronometroEnmiendas'));

const WidgetRegistry = {
  // Widgets Canónicos Únicos
  "establecer_agenda": EstablecerAgenda,
  "importar_paises": ImportarPaises,
  "lista_oradores": ListaOradores,
  "anadir_paises_gsl": AnadirPaisesGSL,
  "cronometro_principal": CronometroPrincipal,
  "cronometro_dual": CronometroDual,
  "cronometro_only_time": CronometroOnlyTime,
  "cronometro_enmiendas": CronometroEnmiendas,
  "pizarra_mociones": PizarraMociones,
  "anadir_paises_debate": AnadirPaisesDebate,
  "votacion_oficial": VotacionOficial,
  "mini_votacion": MiniVotacion,
  "controlador_enmiendas": ControladorEnmiendas,
  "mapa_votacion": MapaVotacion,
  "matriz_paises": MatrizPaises,
  "historico_delegaciones": HistoricoDelegaciones,
  "selector_aleatorio": SelectorAleatorio,
  "gestor_crisis": GestorCrisis,
  "tele_noticias": TeleNoticiasCrisis,
  "pizarra_interactiva": PizarraInteractiva,

  // Alias y Compatibilidad Retroactiva
  "mini_voting": MiniVotacion,
  "votacion_rapida": MiniVotacion,
  "gestor_enmiendas": ControladorEnmiendas,
  "enmiendas": ControladorEnmiendas,
  "amendments_controller": ControladorEnmiendas,
  "timer_enmiendas": CronometroEnmiendas,
  "cronometro_debate_enmiendas": CronometroEnmiendas,
  "configurar_comite": EstablecerAgenda,
  "comite_agenda": EstablecerAgenda,
  "anadir_paises": AnadirPaises,
  "agregar_paises": AnadirPaises,
  "ruleta_paises": SelectorAleatorio,
  "breaking_news": GestorCrisis,
  "tv_crisis": TeleNoticiasCrisis,
  "noticiero_tv": TeleNoticiasCrisis,
  "pizarra_dibujo": PizarraInteractiva,
  "whiteboard": PizarraInteractiva,
  "mapa_interactivo": PizarraInteractiva,
  "voting_map": MapaVotacion,
  "mapa_votos": MapaVotacion,
};

export default WidgetRegistry;


