using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TED_TP3_WEB.Datos
{
    public class Pregunta
    {
        public int idPregunta { get; set; }
        public string pregunta { get; set; }
        public List<Respuesta> listaRespuestas { get; set; }
    }
}
