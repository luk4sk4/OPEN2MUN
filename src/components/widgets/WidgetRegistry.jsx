import CronometroPrincipal from './CronometroPrincipal';
import ListaOradores from './ListaOradores';
import PizarraMociones from './PizarraMociones';
import CronometroDual from './CronometroDual';
import CronometroOnlyTime from './CronometroOnlyTime';
import MatrizPaises from './MatrizPaises';
import HistoricoDelegaciones from './HistoricoDelegaciones';
import VotacionOficial from './VotacionOficial';
import EstablecerAgenda from './EstablecerAgenda';
import ImportarPaises from './ImportarPaises';
import ConfigurarComite from './ConfigurarComite';
import AnadirPaises from './AnadirPaises';
import AnadirPaisesGSL from './AnadirPaisesGSL';
import AnadirPaisesDebate from './AnadirPaisesDebate';
import SelectorAleatorio from './SelectorAleatorio';
import GestorCrisis from './GestorCrisis';
import TeleNoticiasCrisis from './TeleNoticiasCrisis';
import PizarraInteractiva from './PizarraInteractiva';
import MapaVotacion from './MapaVotacion';
import MiniVotacion from './MiniVotacion';
import ControladorEnmiendas from './ControladorEnmiendas';
import CronometroEnmiendas from './CronometroEnmiendas';

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


