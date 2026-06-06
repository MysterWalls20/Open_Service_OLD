namespace Api_Open_Service.Services.Strategy
{
    public interface IEstrategiaPago
    {
        bool ProcesarPago(decimal monto, string concepto);
        string ObtenerReferencia();
    }
}
