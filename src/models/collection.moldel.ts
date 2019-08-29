/**
 * Recaudos
 */
export interface Collection {
    id          : string;   // {ANIOMESDIASEGUNDO-ID CREDITO}
    createdAt   : string;   // Fecha de cobro
    paid        : boolean;  // Estado del pago
    amountPaid  : number;   // Cantidad pagada
    uid         : string;   // ID Cobrador
}