using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.OleDb;
using System.Data;

namespace TED_TP3_WEB.Datos
{
    public class RepositorioPreguntas
    {
        OleDbConnection cnx = new OleDbConnection();
        OleDbCommand cmd = new OleDbCommand();
        //Facultad
        //String cadena = "Provider=SQLOLEDB.1;Password=avisuales1;Persist Security Info=True;User ID=avisuales1;Initial Catalog=PreguntasQuimica;Data Source=maquis";
        //Casa
        String cnxString = "Provider=SQLOLEDB.1;Password=pav2017;Persist Security Info=True;User ID=sa;Initial Catalog=PreguntasQuimica;Data Source=localhost\\SQLEXPRESS";

        public List<Pregunta> ObtenerTodas()
        {
            //abro conexion
            cnx.ConnectionString = cnxString;
            cnx.Open();
            //comando
            cmd.Connection = cnx;
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = "SELECT * FROM Preguntas";
            //cargo tabla
            DataTable tabla = new DataTable();
            tabla.Load(cmd.ExecuteReader());
            cnx.Close();

            //genero objetos
            var preguntas = new List<Pregunta>();
            foreach (DataRow fila in tabla.Rows)
            {
                var p = new Pregunta();
                p.idPregunta = (int)fila["idPregunta"]; ;
                p.pregunta = (string)fila["pregunta"];
                preguntas.Add(p);
            }
            return preguntas;
        }

        public Pregunta ObtenerPorID(int id)
        {
            //abro conexion
            cnx.ConnectionString = cnxString;
            cnx.Open();
            //comando
            cmd.Connection = cnx;
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = "SELECT * FROM Preguntas WHERE idPregunta = " + id.ToString() + ";";
            //cargo tabla
            DataTable tabla = new DataTable();
            tabla.Load(cmd.ExecuteReader());

            //genero objetos
            var pregunta = new Pregunta();
            foreach (DataRow fila in tabla.Rows)
            {
                pregunta.idPregunta = (int)fila["idPregunta"]; ;
                pregunta.pregunta = (string)fila["pregunta"];
            }

            cmd.CommandText = "SELECT * FROM Respuestas WHERE idPregunta = " + id.ToString() + ";";
            //cargo tabla
            tabla = new DataTable();
            tabla.Load(cmd.ExecuteReader());

            //genero objetos
            pregunta.listaRespuestas = new List<Respuesta>();
            foreach (DataRow fila in tabla.Rows)
            {
                Respuesta r = new Respuesta();
                r.idRespuesta = (int)fila["idRespuesta"];
                r.respuesta = fila["respuesta"].ToString();
                r.correcta = (bool)fila["correcta"];
                pregunta.listaRespuestas.Add(r);
            }

            //cierro conexion y retorno
            cnx.Close();
            return pregunta;
        }
    }
}