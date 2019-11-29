using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TED_TP3_WEB
{
    public class PreguntasController : ApiController
    {
        // GET api/preguntas
        public List<Datos.Pregunta> Get()
        {
            Datos.RepositorioPreguntas repo = new Datos.RepositorioPreguntas();
            return repo.ObtenerTodas();
        }

        // GET api/preguntas/5
        public Datos.Pregunta Get(int id)
        {
            Datos.RepositorioPreguntas repo = new Datos.RepositorioPreguntas();
            return repo.ObtenerPorID(id);
        }

        // POST api/preguntas
        public void Post([FromBody]string value)
        {
        }

        // PUT api/preguntas/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/preguntas/5
        public void Delete(int id)
        {
        }
    }
}
