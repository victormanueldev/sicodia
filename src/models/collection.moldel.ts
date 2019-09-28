/**
 * Recaudos
 */
export interface Collection {
    id              : string;   // {ANIOMESDIASEGUNDO-ID CREDITO}
    createdAt       : string;   // Fecha de cobro
    paid            : boolean;  // Estado del pago
    amountPaid      : number;   // Cantidad pagada
    uid             : string;   // ID Cobrador
    username        : string;
    idClient        : string;    // ID del cliente
    fullNameClient  : string;   // Nombre completo del cliente
    idCompany       : number;   // ID de la empresa de cobros
}