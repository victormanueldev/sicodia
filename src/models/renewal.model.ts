/**
 * Renovaciones
 */
export interface Renewal {
    id?                 : string; 
    totalAmount?         : number;    // Monto solicitado
    feesTotalAmount?    : number;   // Valor total de la cuota
    numberFees?         : number;   // Numero total de cutoas
    creditDuration?     : string;   // Duracion del cédito
    requestDate?         : string;    // Fecha de solicitud  
    idClient?            : string;    // Identificacion del cliente
    requestUid?          : string;    // ID del usuario que la solicitó
    state               : string;   // { Pendiente, Aprobada, No Aprobada }
    approvalUid?        : string;    // ID del usuario que aprobó
    approvalDate?       : string;
    idCompany?           : number;
}