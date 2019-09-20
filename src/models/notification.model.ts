/**
 * Estructura de las notificaciones para enviar
 * por FCM HTTP Protocol
 */
export interface Notification {
    notification    : NotificationBody;
    to              : any;
}

/**
 * Datos de la notificacion
 */
export interface NotificationBody {
    title   : string;
    body    : string;
    icon    : string;
}