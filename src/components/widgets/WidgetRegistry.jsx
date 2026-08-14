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

const WidgetRegistry = {
  "establecer_agenda": EstablecerAgenda,
  "cronometro_principal": CronometroPrincipal,
  "lista_oradores": ListaOradores,
  "pizarra_mociones": PizarraMociones,
  "cronometro_dual": CronometroDual,
  "cronometro_only_time": CronometroOnlyTime,
  "matriz_paises": MatrizPaises,
  "historico_delegaciones": HistoricoDelegaciones,
  "votacion_oficial": VotacionOficial,
  "importar_paises": ImportarPaises,
  "configurar_comite": ConfigurarComite,
  "comite_agenda": EstablecerAgenda,
  "anadir_paises_gsl": AnadirPaisesGSL,
  "anadir_paises_debate": AnadirPaisesDebate,
  "anadir_paises": AnadirPaisesGSL,
  "agregar_paises": AnadirPaisesGSL,
};

export default WidgetRegistry;


