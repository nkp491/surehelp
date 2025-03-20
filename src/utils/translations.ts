
// Define the structure of our translations
type TranslationKeys = {
  personalInfo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  updatePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  updateSuccess: string;
  personalInfoUpdated: string;
  passwordUpdated: string;
  error: string;
  updateFailed: string;
  save: string;
  saving: string;
  edit: string;
  cancel: string;
  privacySettings: string;
  showEmail: string;
  showPhone: string;
  showPhoto: string;
  privacyUpdated: string;
  languageSettings: string;
  notificationPreferences: string;
  emailNotifications: string;
  phoneNotifications: string;
  inAppNotifications: string;
  teamUpdates: string;
  meetingReminders: string;
  performanceUpdates: string;
  systemAnnouncements: string;
  roleChanges: string;
  doNotDisturb: string;
  quietHours: string;
  from: string;
  to: string;
  notifications: string;
  markAllAsRead: string;
  viewAll: string;
  noNotifications: string;
  allCaughtUp: string;
  search: string;
  teamDirectory: string;
  skills: string;
  department: string;
  location: string;
  contactInfo: string;
  bio: string;
  reportingStructure: string;
  reportsTo: string;
  directReports: string;
};

// English translations
const en: TranslationKeys = {
  personalInfo: "Personal Information",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  password: "Password",
  updatePassword: "Update Password",
  currentPassword: "Current Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  updateSuccess: "Success",
  personalInfoUpdated: "Personal information updated successfully",
  passwordUpdated: "Password updated successfully",
  error: "Error",
  updateFailed: "Update failed. Please try again.",
  save: "Save",
  saving: "Saving...",
  edit: "Edit",
  cancel: "Cancel",
  privacySettings: "Privacy Settings",
  showEmail: "Show my email to other users",
  showPhone: "Show my phone number to other users",
  showPhoto: "Show my profile photo to other users",
  privacyUpdated: "Privacy settings updated successfully",
  languageSettings: "Language Settings",
  notificationPreferences: "Notification Preferences",
  emailNotifications: "Email Notifications",
  phoneNotifications: "Phone Notifications",
  inAppNotifications: "In-App Notifications",
  teamUpdates: "Team Updates",
  meetingReminders: "Meeting Reminders",
  performanceUpdates: "Performance Updates",
  systemAnnouncements: "System Announcements",
  roleChanges: "Role Changes",
  doNotDisturb: "Do Not Disturb",
  quietHours: "Quiet Hours",
  from: "From",
  to: "To",
  notifications: "Notifications",
  markAllAsRead: "Mark all as read",
  viewAll: "View all",
  noNotifications: "No notifications",
  allCaughtUp: "You're all caught up!",
  search: "Search",
  teamDirectory: "Team Directory",
  skills: "Skills",
  department: "Department",
  location: "Location",
  contactInfo: "Contact Information",
  bio: "Bio",
  reportingStructure: "Reporting Structure",
  reportsTo: "Reports To",
  directReports: "Direct Reports",
};

// Spanish translations
const es: TranslationKeys = {
  personalInfo: "Información Personal",
  firstName: "Nombre",
  lastName: "Apellido",
  email: "Correo Electrónico",
  phone: "Teléfono",
  password: "Contraseña",
  updatePassword: "Actualizar Contraseña",
  currentPassword: "Contraseña Actual",
  newPassword: "Nueva Contraseña",
  confirmPassword: "Confirmar Contraseña",
  updateSuccess: "Éxito",
  personalInfoUpdated: "Información personal actualizada con éxito",
  passwordUpdated: "Contraseña actualizada con éxito",
  error: "Error",
  updateFailed: "Actualización fallida. Por favor, inténtelo de nuevo.",
  save: "Guardar",
  saving: "Guardando...",
  edit: "Editar",
  cancel: "Cancelar",
  privacySettings: "Configuración de Privacidad",
  showEmail: "Mostrar mi correo electrónico a otros usuarios",
  showPhone: "Mostrar mi número de teléfono a otros usuarios",
  showPhoto: "Mostrar mi foto de perfil a otros usuarios",
  privacyUpdated: "Configuración de privacidad actualizada con éxito",
  languageSettings: "Configuración de Idioma",
  notificationPreferences: "Preferencias de Notificación",
  emailNotifications: "Notificaciones por Correo",
  phoneNotifications: "Notificaciones por Teléfono",
  inAppNotifications: "Notificaciones en la Aplicación",
  teamUpdates: "Actualizaciones del Equipo",
  meetingReminders: "Recordatorios de Reuniones",
  performanceUpdates: "Actualizaciones de Rendimiento",
  systemAnnouncements: "Anuncios del Sistema",
  roleChanges: "Cambios de Rol",
  doNotDisturb: "No Molestar",
  quietHours: "Horas de Silencio",
  from: "Desde",
  to: "Hasta",
  notifications: "Notificaciones",
  markAllAsRead: "Marcar todo como leído",
  viewAll: "Ver todo",
  noNotifications: "No hay notificaciones",
  allCaughtUp: "¡Estás al día!",
  search: "Buscar",
  teamDirectory: "Directorio del Equipo",
  skills: "Habilidades",
  department: "Departamento",
  location: "Ubicación",
  contactInfo: "Información de Contacto",
  bio: "Biografía",
  reportingStructure: "Estructura de Reporte",
  reportsTo: "Reporta a",
  directReports: "Reportes Directos",
};

export const translations = {
  en,
  es
};
